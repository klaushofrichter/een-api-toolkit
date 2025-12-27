#!/bin/bash
# Verify the built package works correctly before publishing
# Tests: build output, tarball creation, TypeScript declarations

set -e

echo "=== Package Verification ==="
echo ""

# Step 1: Build the package
echo "1. Building package..."
npm run build > /dev/null 2>&1
echo "   ✓ Build successful"
echo ""

# Step 2: Verify dist contents
echo "2. Verifying dist contents..."
REQUIRED_FILES=("dist/index.js" "dist/index.cjs" "dist/index.d.ts")
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "   ✗ Missing: $file"
    exit 1
  fi
  echo "   ✓ $file"
done
echo ""

# Step 3: Create tarball and verify contents
echo "3. Creating and verifying tarball..."
# npm pack outputs the tarball name on the last line; filter out other output
TARBALL=$(npm pack 2>&1 | grep -E '\.tgz$' | tail -1)
echo "   Created: $TARBALL"

# Check tarball contains expected files
tar -tzf "$TARBALL" | grep -q "package/dist/index.js" || { echo "   ✗ Missing index.js in tarball"; exit 1; }
tar -tzf "$TARBALL" | grep -q "package/dist/index.cjs" || { echo "   ✗ Missing index.cjs in tarball"; exit 1; }
tar -tzf "$TARBALL" | grep -q "package/dist/index.d.ts" || { echo "   ✗ Missing index.d.ts in tarball"; exit 1; }
tar -tzf "$TARBALL" | grep -q "package/package.json" || { echo "   ✗ Missing package.json in tarball"; exit 1; }
echo "   ✓ Tarball contents verified"
rm -f "$TARBALL"
echo ""

# Step 4: Verify TypeScript declarations are valid
echo "4. Verifying TypeScript declarations..."
# Check that the .d.ts file has expected exports
if grep -q "export.*initEenToolkit" dist/index.d.ts && \
   grep -q "export.*getAuthUrl" dist/index.d.ts && \
   grep -q "export.*useCurrentUser" dist/index.d.ts && \
   grep -q "export.*Result" dist/index.d.ts; then
  echo "   ✓ Key exports found in declarations"
else
  echo "   ✗ Missing expected exports in declarations"
  exit 1
fi
echo ""

# Step 5: Verify ESM and CJS syntax
echo "5. Verifying module formats..."
# ESM should have export statements
if grep -q "^export" dist/index.js; then
  echo "   ✓ ESM format valid (dist/index.js)"
else
  echo "   ✗ ESM format invalid"
  exit 1
fi

# CJS should have exports or module.exports
if grep -q "exports\." dist/index.cjs || grep -q "module.exports" dist/index.cjs; then
  echo "   ✓ CJS format valid (dist/index.cjs)"
else
  echo "   ✗ CJS format invalid"
  exit 1
fi
echo ""

# Step 6: Check package.json exports configuration
echo "6. Verifying package.json exports..."
node -e "
const pkg = require('./package.json');
const checks = [
  [pkg.main === './dist/index.cjs', 'main points to CJS'],
  [pkg.module === './dist/index.js', 'module points to ESM'],
  [pkg.types === './dist/index.d.ts', 'types points to declarations'],
  [pkg.exports['.'].import === './dist/index.js', 'exports.import configured'],
  [pkg.exports['.'].require === './dist/index.cjs', 'exports.require configured'],
  [pkg.exports['.'].types === './dist/index.d.ts', 'exports.types configured'],
];
let failed = false;
checks.forEach(([ok, msg]) => {
  if (ok) console.log('   ✓', msg);
  else { console.log('   ✗', msg); failed = true; }
});
if (failed) process.exit(1);
"
echo ""

echo "=== Package verification passed! ==="
echo ""
echo "Ready to publish v$(node -p "require('./package.json').version")"
