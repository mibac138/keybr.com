#!/usr/bin/env -S node -r @keybr/tsl

/**
 * This script takes word frequency dictionaries and generates phonetic models.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { Language } from "@keybr/keyboard";
import { TransitionTableBuilder } from "@keybr/phonetic-model";
import {
  fromCsv,
  normalizeCounts,
  sortByCount,
  type Word,
} from "./language/words.ts";
import { pathTo } from "./root.ts";

for (const language of Language.ALL) {
  generate(language);
}

function generate(language: Language): void {
  const { id, alphabet } = language;

  const dictPath = pathTo(`dictionary/dictionary-${id}.csv`);
  const modelPath = pathTo(`../keybr-phonetic-model/assets/model-${id}.data`);
  const wordsPath = pathTo(`../keybr-content-words/lib/data/words-${id}.json`);

  const dict = readDict();
  if (dict != null) {
    console.log(`[${id}] ${dict.length} unique words`);
    generateModel(dict);
    generateWordList(
      sortByCount(language, dict)
        .slice(0, 3000)
        .map(([word]) => word),
    );
  }

  function generateModel(dict: Word[]): void {
    const builder = new TransitionTableBuilder(4, [0x0020, ...alphabet]);
    for (const [word, count] of dict) {
      if (word.length >= 3) {
        for (let i = 0; i < count; i++) {
          builder.append(language.lowerCase(word));
        }
      }
    }
    const data = builder.build().compress();
    writeFileSync(modelPath, data);
    console.log(`[${id}] Generated model (${data.length} bytes)`);
  }

  function generateWordList(words: string[]): void {
    const prev = readWordsJson();
    if (prev.length > 0) {
      const added = [];
      for (const item of words) {
        if (!prev.includes(item)) {
          added.push(item);
        }
      }
      const deleted = [];
      for (const item of prev) {
        if (!words.includes(item)) {
          deleted.push(item);
        }
      }
      if (added.length > 0) {
        console.log(
          `[${id}] Added words:`,
          "\x1b[32m",
          ...added.sort(language.compare),
          "\x1b[0m",
        );
      }
      if (deleted.length > 0) {
        console.log(
          `[${id}] Deleted words:`,
          "\x1b[31m",
          ...deleted.sort(language.compare),
          "\x1b[0m",
        );
      }
    }
    writeWordsJson(words);
    console.log(`[${id}] Generated word list (${words.length} words)`);
  }

  function readDict(): Word[] | null {
    const data = readCompressed(dictPath);
    if (data != null) {
      const unique = new Set();
      const dict = fromCsv(data)
        .filter(([word]) => {
          if (language.test(word)) {
            return true;
          } else {
            console.warn(`[${id}] Extraneous word [${word}]`);
            return false;
          }
        })
        .filter(([word]) => {
          word = language.lowerCase(word);
          if (!unique.has(word)) {
            unique.add(word);
            return true;
          } else {
            console.warn(`[${id}] Duplicate word [${word}]`);
            return false;
          }
        });
      return normalizeCounts(dict);
    }
    return null;
  }

  function readWordsJson(): string[] {
    try {
      return JSON.parse(readFileSync(wordsPath).toString("utf-8"));
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    return [];
  }

  function writeWordsJson(words: string[]): void {
    writeFileSync(wordsPath, JSON.stringify(words, null, 2));
  }

  function readCompressed(path: string): string | null {
    try {
      return gunzipSync(readFileSync(`${path}.gz`)).toString("utf-8");
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    try {
      return readFileSync(path).toString("utf-8");
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    return null;
  }
}
