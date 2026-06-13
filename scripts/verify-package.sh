#!/bin/bash
# Verify the built package works correctly before publishing
# Tests: build output, tarball creation, TypeScript declarations

set -e

echo "=== Package Verification ==="
echo ""

# Step 1: Build the package
echo "1. Building package..."
if ! npm run build > /tmp/build-output.log 2>&1; then
  echo "   ✗ Build failed:"
  cat /tmp/build-output.log
  exit 1
fi
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

# Validate tarball was created
if [ -z "$TARBALL" ]; then
  echo "   ✗ Failed to create tarball (empty filename)"
  exit 1
fi
if [ ! -f "$TARBALL" ]; then
  echo "   ✗ Tarball file not found: $TARBALL"
  exit 1
fi
echo "   Created: $TARBALL"

# Check tarball contains expected files
tar -tzf "$TARBALL" | grep -q "package/dist/index.js" || { echo "   ✗ Missing index.js in tarball"; exit 1; }
tar -tzf "$TARBALL" | grep -q "package/dist/index.cjs" || { echo "   ✗ Missing index.cjs in tarball"; exit 1; }
tar -tzf "$TARBALL" | grep -q "package/dist/index.d.ts" || { echo "   ✗ Missing index.d.ts in tarball"; exit 1; }
tar -tzf "$TARBALL" | grep -q "package/package.json" || { echo "   ✗ Missing package.json in tarball"; exit 1; }
tar -tzf "$TARBALL" | grep -q "package/examples/vue-users" || { echo "   ✗ Missing examples in tarball"; exit 1; }

# Ensure no secret-bearing files are packaged (live .env credentials, cached
# tokens). Anchored with (^|/) so a root-level file is caught too, and .env
# variants like .env.local are included; .env.example is intentionally shipped.
if tar -tzf "$TARBALL" | grep -E '(^|/)\.env(\.[^/]+)?$|(^|/)\.auth-state\.json$' | grep -vE '\.env\.example$'; then
  echo "   ✗ Tarball contains secret files (.env / .auth-state.json) — aborting"
  rm -f "$TARBALL"
  exit 1
fi
echo "   ✓ No secret files (.env, .auth-state.json) in tarball"
echo "   ✓ Tarball contents verified (dist, examples, package.json)"
rm -f "$TARBALL"
echo ""

# Step 4: Verify TypeScript declarations are valid
echo "4. Verifying TypeScript declarations..."
# Check that the .d.ts file has expected exports
if grep -q "export.*initEenToolkit" dist/index.d.ts && \
   grep -q "export.*getAuthUrl" dist/index.d.ts && \
   grep -q "export.*getCurrentUser" dist/index.d.ts && \
   grep -q "export.*getUsers" dist/index.d.ts && \
   grep -q "export.*getCameras" dist/index.d.ts && \
   grep -q "export.*Result" dist/index.d.ts; then
  echo "   ✓ Key exports found in declarations"
else
  echo "   ✗ Missing expected exports in declarations"
  exit 1
fi

# Type-check the rolled-up declaration itself. grep only proves names are
# present; this catches dangling/broken type references in the bundled
# .d.ts (the failure mode an API Extractor / vite-plugin-dts change can
# introduce). NOTE: do NOT add --skipLibCheck here — it suppresses the
# semantic checking of .d.ts files, which is exactly the dangling-reference
# check we want (verified: a TS2304 in dist/index.d.ts passes under
# --skipLibCheck but fails without it). A clean rolled-up build resolves
# vue/pinia/node types without error, so the gate stays quiet when correct.
DTS_LOG=$(mktemp)
if npx tsc --noEmit dist/index.d.ts > "$DTS_LOG" 2>&1; then
  echo "   ✓ Bundled declaration type-checks (no dangling references)"
  rm -f "$DTS_LOG"
else
  echo "   ✗ Bundled declaration failed to type-check:"
  cat "$DTS_LOG"
  rm -f "$DTS_LOG"
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
