#!/bin/bash
# Install skills from cloned GitHub repos into /home/z/my-project/skills/
set -e
REPOS=/home/z/my-project/skills-repos
SKILLS=/home/z/my-project/skills
cd "$REPOS"

echo "=== 1) claude-seo: installing 25 SEO skills ==="
for d in claude-seo/skills/*/; do
  name=$(basename "$d")
  if [ -f "$d/SKILL.md" ]; then
    rm -rf "$SKILLS/$name"
    cp -r "$d" "$SKILLS/$name"
    echo "  installed: $name"
  fi
done

echo "=== 2) mattpocock/skills: engineering + productivity + misc ==="
for group in engineering productivity misc; do
  for d in mattpocock-skills/skills/$group/*/; do
    name=$(basename "$d")
    if [ -f "$d/SKILL.md" ]; then
      rm -rf "$SKILLS/$name"
      cp -r "$d" "$SKILLS/$name"
      echo "  installed: $name"
    fi
  done
done

echo "=== 3) ruflo: main orchestration skill ==="
rm -rf "$SKILLS/ruflo"
mkdir -p "$SKILLS/ruflo"
cp ruflo/SKILL.md "$SKILLS/ruflo/"
cp ruflo/README.md "$SKILLS/ruflo/" 2>/dev/null || true
echo "  installed: ruflo"

echo "=== 4) ai-engineering-hub: hugging-face skills + grpo-finetune ==="
for d in ai-engineering-hub/hugging-face-skills/skills/*/; do
  name=$(basename "$d")
  if [ -f "$d/SKILL.md" ]; then
    rm -rf "$SKILLS/$name"
    cp -r "$d" "$SKILLS/$name"
    echo "  installed: $name"
  fi
done
if [ -f ai-engineering-hub/grpo-finetuning-qwen3/agent-skill/grpo-finetune/SKILL.md ]; then
  rm -rf "$SKILLS/grpo-finetune"
  cp -r ai-engineering-hub/grpo-finetuning-qwen3/agent-skill/grpo-finetune "$SKILLS/grpo-finetune"
  echo "  installed: grpo-finetune"
fi

echo "=== 5) ui-ux-pro-max: verify already installed ==="
if [ -f "$SKILLS/ui-ux-pro-max/SKILL.md" ]; then
  echo "  OK: ui-ux-pro-max already installed (repo v2.13.0 content)"
fi

echo "=== 6) freellmapi: NOT a skill (it is a Node.js API server) ==="
echo "  documented only - see README"

echo ""
echo "=== FINAL COUNT ==="
ls -1 "$SKILLS" | wc -l
