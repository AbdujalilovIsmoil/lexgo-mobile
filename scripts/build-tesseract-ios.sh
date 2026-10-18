#!/usr/bin/env bash
# Builds Tesseract + Leptonica as one static xcframework (iOS device arm64 + simulator arm64) for modules/text-ocr.
#   scripts/build-tesseract-ios.sh <work dir>      needs: cmake, ninja, git, Xcode
# The result is committed (modules/text-ocr/ios/Frameworks/TesseractKit.xcframework), so builds do not need to run this.
set -euo pipefail

LEPT_TAG=1.87.0
TESS_TAG=5.5.3
IOS_MIN=16.0
WORK=$(cd "${1:?usage: $0 <work dir>}" && pwd)
OUT="$(cd "$(dirname "$0")/.." && pwd)/modules/text-ocr/ios/Frameworks"

[ -d "$WORK/leptonica" ] || git clone -q --depth 1 --branch "$LEPT_TAG" https://github.com/DanBloomberg/leptonica.git "$WORK/leptonica"
[ -d "$WORK/tesseract" ] || git clone -q --depth 1 --branch "$TESS_TAG" https://github.com/tesseract-ocr/tesseract.git "$WORK/tesseract"

slice() { # <name> <sdk>
  local name=$1 sdk=$2 prefix="$WORK/install/$1"
  local common=(-G Ninja -DCMAKE_SYSTEM_NAME=iOS -DCMAKE_OSX_SYSROOT="$sdk" -DCMAKE_OSX_ARCHITECTURES=arm64 -DCMAKE_OSX_DEPLOYMENT_TARGET="$IOS_MIN"
    -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF -DCMAKE_INSTALL_PREFIX="$prefix" -DCMAKE_POSITION_INDEPENDENT_CODE=ON -DCMAKE_FIND_ROOT_PATH_MODE_PACKAGE=BOTH)
  cmake -S "$WORK/leptonica" -B "$WORK/build/lept-$name" "${common[@]}" -DSW_BUILD=OFF -DBUILD_PROG=OFF \
    -DENABLE_ZLIB=OFF -DENABLE_PNG=OFF -DENABLE_GIF=OFF -DENABLE_JPEG=OFF -DENABLE_TIFF=OFF -DENABLE_WEBP=OFF -DENABLE_OPENJPEG=OFF
  cmake --build "$WORK/build/lept-$name" --target install
  cmake -S "$WORK/tesseract" -B "$WORK/build/tess-$name" "${common[@]}" -DCMAKE_PREFIX_PATH="$prefix" -DLeptonica_DIR="$prefix/lib/cmake/leptonica" \
    -DSW_BUILD=OFF -DBUILD_TESSERACT_BINARY=OFF -DBUILD_TRAINING_TOOLS=OFF -DBUILD_TESTS=OFF -DDISABLE_ARCHIVE=ON -DDISABLE_CURL=ON \
    -DOPENMP_BUILD=OFF -DGRAPHICS_DISABLED=ON -DDISABLE_TIFF=ON \
    -DLEPT_TIFF_RESULT=1 -DLEPT_TIFF_COMPILE_SUCCESS=TRUE  # cannot run the TIFF probe when cross-compiling: Leptonica has no TIFF here
  cmake --build "$WORK/build/tess-$name" --target install
  libtool -static -o "$prefix/lib/libTesseractKit.a" "$prefix"/lib/libtesseract*.a "$prefix"/lib/libleptonica*.a
}

slice device iphoneos
slice sim iphonesimulator

HEADERS="$WORK/headers"
rm -rf "$HEADERS" && mkdir -p "$HEADERS"
cp -R "$WORK/install/device/include/tesseract" "$WORK/install/device/include/leptonica" "$HEADERS/"
cat > "$HEADERS/module.modulemap" <<'MAP'
module TesseractKit {
  header "tesseract/capi.h"
  export *
}
MAP
rm -rf "$OUT/TesseractKit.xcframework" && mkdir -p "$OUT"
xcodebuild -create-xcframework -library "$WORK/install/device/lib/libTesseractKit.a" -headers "$HEADERS" \
  -library "$WORK/install/sim/lib/libTesseractKit.a" -headers "$HEADERS" -output "$OUT/TesseractKit.xcframework"
echo "built $OUT/TesseractKit.xcframework"
