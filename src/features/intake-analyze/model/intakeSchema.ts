import { z } from "zod";
import { MIN_PROBLEM_CHARS } from "@/entities/intake/model/types";
import * as rules from "@/shared/form/rules";

// The problem the client describes before the AI classifies it: enough words to classify, not a novel.
export const intakeSchema = z.object({ text: rules.text(MIN_PROBLEM_CHARS, 4000) });
