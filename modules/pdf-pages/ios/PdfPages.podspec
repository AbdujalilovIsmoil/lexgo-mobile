Pod::Spec.new do |s|
  s.name           = 'PdfPages'
  s.version        = '1.0.0'
  s.summary        = 'Renders PDF pages to images (PDFKit)'
  s.description    = 'Renders PDF pages to images (PDFKit) for the in-app file viewer'
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
