package org.cognilabs.netpath

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkInfo
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// The network the OS gives THIS app, in more detail than "connected or not": whether the default network is blocked for the app
// (a per-app data restriction — MIUI / HyperOS "restrict data usage", an always-on VPN that is down, battery restrictions), the
// interfaces, validation and Data Saver. The connection monitor uses it to tell "no internet" from "LexGo is not allowed to use it".
// The blocked state comes from the default-network callback (onBlockedStatusChanged): the network state an app can read directly
// does not show every per-app restriction (an OEM firewall rule leaves it "connected").
class NetPathModule : Module() {
  @Volatile private var blocked: Boolean? = null
  private var callback: ConnectivityManager.NetworkCallback? = null

  private fun manager(): ConnectivityManager? =
    appContext.reactContext?.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager

  override fun definition() = ModuleDefinition {
    Name("NetPath")

    OnCreate {
      val cm = manager() ?: return@OnCreate
      val cb = object : ConnectivityManager.NetworkCallback() {
        override fun onBlockedStatusChanged(network: Network, isBlocked: Boolean) {
          blocked = isBlocked
        }

        override fun onLost(network: Network) {
          blocked = null
        }
      }
      try {
        cm.registerDefaultNetworkCallback(cb)
        callback = cb
      } catch (_: RuntimeException) {
        // too many callbacks registered by the app: the direct state below still answers
      }
    }

    OnDestroy {
      val cb = callback ?: return@OnDestroy
      try {
        manager()?.unregisterNetworkCallback(cb)
      } catch (_: RuntimeException) {
      }
      callback = null
    }

    AsyncFunction("readAsync") {
      val cm = manager() ?: return@AsyncFunction mapOf("status" to "unknown", "reason" to "none", "interfaces" to emptyList<String>())
      // The callback reports the current state right after it is registered; give it a moment on a cold start.
      var waited = 0
      while (blocked == null && callback != null && cm.activeNetwork != null && waited < 10) {
        Thread.sleep(100)
        waited += 1
      }
      @Suppress("DEPRECATION")
      val info = cm.activeNetworkInfo // per app: BLOCKED for some restrictions (Data Saver in the background, …)
      val network = cm.activeNetwork
      val caps = network?.let { cm.getNetworkCapabilities(it) }
      @Suppress("DEPRECATION")
      val isBlocked = blocked == true || info?.detailedState == NetworkInfo.DetailedState.BLOCKED
      val interfaces = mutableListOf<String>()
      if (caps != null) {
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) interfaces.add("wifi")
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) interfaces.add("cellular")
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) interfaces.add("ethernet")
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) interfaces.add("vpn")
      }
      val status = when {
        isBlocked -> "unsatisfied"
        caps != null && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) -> "satisfied"
        else -> "unsatisfied"
      }
      val reason = when {
        isBlocked -> "blocked"
        status == "satisfied" -> "none"
        else -> "notAvailable"
      }
      val dataSaver = when (cm.restrictBackgroundStatus) {
        ConnectivityManager.RESTRICT_BACKGROUND_STATUS_ENABLED -> "on"
        ConnectivityManager.RESTRICT_BACKGROUND_STATUS_WHITELISTED -> "allowed"
        else -> "off"
      }
      mapOf(
        "status" to status,
        "reason" to reason,
        "interfaces" to interfaces,
        "expensive" to cm.isActiveNetworkMetered,
        "validated" to (caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED) == true),
        "dataSaver" to dataSaver,
      )
    }
  }
}
