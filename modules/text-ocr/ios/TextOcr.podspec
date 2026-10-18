Pod::Spec.new do |s|
  s.name           = 'TextOcr'
  s.version        = '1.0.0'
  s.summary        = 'On-device text recognition (Apple Vision, Tesseract) for scanned pages'
  s.description    = 'On-device text recognition (Apple Vision, Tesseract) for scanned pages'
  s.license        = 'MIT'
  s.author         = 'LexGo'
  s.homepage       = 'https://lexgo.uz'
  s.platforms      = { :ios => '16.0' }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://lexgo.uz' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Tesseract + Leptonica built by scripts/build-tesseract-ios.sh; the models are copies of the ones in android/src/main/assets/tessdata.
  s.vendored_frameworks = 'Frameworks/TesseractKit.xcframework'
  s.libraries = 'c++'
  s.resource_bundles = { 'TextOcrData' => ['tessdata/*.traineddata'] }

  s.source_files = "*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
