/**
 * Custom Anthropic provider for Promptfoo evaluations.
 *
 * Injects the skill content as system context before each prompt.
 * Requires ANTHROPIC_API_KEY environment variable.
 *
 * Usage in promptfoo.yaml:
 *   providers:
 *     - id: file://scripts/anthropic-provider.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const SKILLS_DIR = path.resolve(__dirname, '../../packages/plugins/vechain-dev/skills');

function loadSkillContext(): string {
  const skills: string[] = [];

  for (const skillDir of fs.readdirSync(SKILLS_DIR)) {
    const skillMd = path.join(SKILLS_DIR, skillDir, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      skills.push(fs.readFileSync(skillMd, 'utf-8'));
    }
  }

  return skills.join('\n\n---\n\n');
}

export default class AnthropicProvider {
  private client: Anthropic;
  private skillContext: string;

  constructor() {
    this.client = new Anthropic();
    this.skillContext = loadSkillContext();
  }

  id() {
    return 'anthropic-with-skills';
  }

  async callApi(prompt: string) {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: this.skillContext,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return { output: text };
  }
}
