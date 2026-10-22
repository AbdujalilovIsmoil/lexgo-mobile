package org.cognilabs.netpath

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.NetworkInfo
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// The network the OS gives THIS app, in more detail than "connected or not": whether the default network is blocked for the app
// (a per-app data restriction — MIUI / HyperOS "restrict data usage", an always-on VPN that is down, battery restrictions), the
// interfaces, validation and Data Saver. The connection monitor uses it to tell "no internet" from "LexGo is not allowed to use it".
class NetPathModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NetPath")

    AsyncFunction("readAsync") {
      val context = appContext.reactContext ?: return@AsyncFunction mapOf("status" to "unknown", "reason" to "none", "interfaces" to emptyList<String>())
      val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
      @Suppress("DEPRECATION")
      val info = cm.activeNetworkInfo // per app: BLOCKED when the default network is blocked for this app
      val network = cm.activeNetwork // null when there is no default network, or when it is blocked for this app
      val caps = network?.let { cm.getNetworkCapabilities(it) }
      @Suppress("DEPRECATION")
      val blocked = info?.detailedState == NetworkInfo.DetailedState.BLOCKED
      val interfaces = mutableListOf<String>()
      if (caps != null) {
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) interfaces.add("wifi")
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) interfaces.add("cellular")
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) interfaces.add("ethernet")
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) interfaces.add("vpn")
      }
      val status = when {
        blocked -> "unsatisfied"
        caps != null && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) -> "satisfied"
        else -> "unsatisfied"
      }
      val reason = when {
        blocked -> "blocked"
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
