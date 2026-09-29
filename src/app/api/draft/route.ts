import "server-only";
import { handleDraft } from "../../../server/handler";
export const runtime = "nodejs";
export const POST = handleDraft;
