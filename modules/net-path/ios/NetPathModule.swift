import CoreTelephony
import ExpoModulesCore
import Network

// The network path the OS gives THIS app, in more detail than "connected or not": when the path is unsatisfied, why (the app's
// Mobile Data / Wireless Data switch is off, no network at all, the VPN is down), the interfaces, and whether cellular data is
// restricted for the app. The connection monitor uses it to tell "no internet" from "LexGo is not allowed to use the internet".
public class NetPathModule: Module {
  private let queue = DispatchQueue(label: "org.cognilabs.netpath")
  private let monitor = NWPathMonitor()
  private var latest: NWPath? // written and read on `queue` only
  private var cellular: CTCellularData?
  private var cellularState = "unknown" // written and read on `queue` only

  public func definition() -> ModuleDefinition {
    Name("NetPath")

    OnCreate {
      monitor.pathUpdateHandler = { [weak self] path in self?.latest = path }
      monitor.start(queue: queue)
      let data = CTCellularData()
      data.cellularDataRestrictionDidUpdateNotifier = { [weak self] state in
        self?.queue.async { self?.cellularState = Self.name(of: state) }
      }
      cellular = data
    }

    OnDestroy {
      monitor.cancel()
      cellular?.cellularDataRestrictionDidUpdateNotifier = nil
    }

    AsyncFunction("readAsync") { () -> [String: Any] in
      // The first path arrives right after the monitor starts; wait for it a little if the module was just created.
      var path = queue.sync { latest }
      var waited = 0
      while path == nil && waited < 20 {
        usleep(100_000)
        waited += 1
        path = queue.sync { latest }
      }
      var out = Self.describe(path)
      out["cellular"] = queue.sync { cellularState }
      return out
    }
  }

  private static func name(of state: CTCellularDataRestrictedState) -> String {
    switch state {
    case .restricted: return "restricted"
    case .notRestricted: return "notRestricted"
    default: return "unknown"
    }
  }

  private static func describe(_ path: NWPath?) -> [String: Any] {
    guard let path else { return ["status": "unknown", "reason": "none", "interfaces": [String]()] }
    let status: String
    switch path.status {
    case .satisfied: status = "satisfied"
    case .unsatisfied: status = "unsatisfied"
    case .requiresConnection: status = "requiresConnection"
    @unknown default: status = "unknown"
    }
    var reason = "none"
    if path.status != .satisfied {
      switch path.unsatisfiedReason {
      case .notAvailable: reason = "notAvailable"
      case .cellularDenied: reason = "cellularDenied"
      case .wifiDenied: reason = "wifiDenied"
      case .localNetworkDenied: reason = "localNetworkDenied"
      default:
        if #available(iOS 17.0, *), path.unsatisfiedReason == .vpnInactive { reason = "vpnInactive" } else { reason = "other" }
      }
    }
    let interfaces = path.availableInterfaces.map { (i: NWInterface) -> String in
      switch i.type {
      case .wifi: return "wifi"
      case .cellular: return "cellular"
      case .wiredEthernet: return "ethernet"
      case .loopback: return "loopback"
      default: return "other"
      }
    }
    return [
      "status": status,
      "reason": reason,
      "interfaces": interfaces,
      "expensive": path.isExpensive,
      "constrained": path.isConstrained,
      "ipv4": path.supportsIPv4,
      "ipv6": path.supportsIPv6,
      "dns": path.supportsDNS,
    ]
  }
}
