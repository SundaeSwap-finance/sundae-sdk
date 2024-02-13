xmllint --noout test-results/jest-junit.xml
  if grep -q '<failure' test-results/jest-junit.xml; then
    echo "Tests failures detected in jest-junit.xml"
    exit 1
  else
    echo "No test failures found in jest-junit.xml"
  fi