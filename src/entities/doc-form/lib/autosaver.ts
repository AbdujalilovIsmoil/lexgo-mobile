export type SaveState = "idle" | "saving" | "saved" | "error";

// The server autosave of a document request (README §7.3): the FULL current answers go out ~800 ms after the last change, never two saves at
// once (a change made while one is in flight is sent right after it), a failed save keeps what was typed and waits for `retry`. Pure: the
// clock and the save call are injected, so it is tested without React.
export class Autosaver {
  private known = ""; // what the server holds (the last successful save / the loaded answers)
  private want = "";
  private busy = false;
  private again = false;
  private dead = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  state: SaveState = "idle";

  constructor(
    private run: (json: string) => Promise<void>,
    private onState: (s: SaveState) => void,
    private delay = 800,
    private setT: (f: () => void, ms: number) => ReturnType<typeof setTimeout> = setTimeout,
    private clearT: (t: ReturnType<typeof setTimeout>) => void = clearTimeout,
  ) {}

  private set(s: SaveState) {
    this.state = s;
    this.onState(s);
  }

  /** Done with this request (the document was generated): later changes are not sent. */
  stop(): void {
    this.dead = true;
    if (this.timer) this.clearT(this.timer);
    this.timer = undefined;
  }

  /** The answers the server already has: nothing to save until they differ. */
  baseline(json: string): void {
    this.known = json;
    if (!this.busy) this.want = json;
  }

  /** The current full answers (as JSON). */
  push(json: string): void {
    if (this.dead) return;
    this.want = json;
    if (this.timer) this.clearT(this.timer);
    this.timer = undefined;
    if (json === this.known) { // typed back to what the server holds
      if (this.state === "error") this.set("saved");
      return;
    }
    this.timer = this.setT(() => void this.fire(), this.delay);
  }

  /** Save now (leaving the screen, the app going to the background, or a tap on "retry"). */
  async flush(): Promise<void> {
    if (this.dead) return;
    if (this.timer) this.clearT(this.timer);
    this.timer = undefined;
    if (this.want !== this.known) await this.fire();
  }

  retry = (): Promise<void> => this.flush();

  private async fire(): Promise<void> {
    this.timer = undefined;
    if (this.busy) {
      this.again = true;
      return;
    }
    const json = this.want;
    if (json === this.known) return;
    this.busy = true;
    this.set("saving");
    try {
      await this.run(json);
      this.known = json;
      this.set("saved");
    } catch {
      this.set("error");
    } finally {
      this.busy = false;
    }
    if (this.again && this.state !== "error") {
      this.again = false;
      if (this.want !== this.known) await this.fire();
    } else this.again = false;
  }
}
