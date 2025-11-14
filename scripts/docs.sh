for dir in packages/*; do
  if [ "$dir" == "packages/demo" ]; then
    continue
  fi
  (cd "$dir" && bun run docs:ci || true)
done
