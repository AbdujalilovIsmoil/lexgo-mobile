Pod::Spec.new do |s|
  s.name           = 'NetPath'
  s.version        = '1.0.0'
  s.summary        = 'Why the OS gives this app no network (NWPath)'
  s.description    = 'Reports the network path the OS gives the app: status, the reason it is unsatisfied, interfaces, cellular data restriction'
  s.license        = 'MIT'
  s.author         = 'LexGo'
  s.homepage       = 'https://lexgo.uz'
  s.platforms      = { :ios => '16.0' }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://lexgo.uz' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = "*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
