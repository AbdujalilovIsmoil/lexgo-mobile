import type { Room } from "livekit-client";
import { setRemoteVoices } from "./captureAudio";

jest.mock("livekit-client", () => ({ Track: { Kind: { Audio: "audio", Video: "video" } } }));

const voice = () => {
  const track = { mediaStreamTrack: { enabled: true } };
  return { kind: "audio", track, setEnabled: jest.fn() };
};

describe("setRemoteVoices", () => {
  it("switches every other person's voice off on the server and on the phone, and back on", () => {
    const a = voice(), b = voice(), c = voice();
    const room = { remoteParticipants: new Map([["x", { audioTrackPublications: new Map([["1", a], ["2", b]]) }], ["y", { audioTrackPublications: new Map([["3", c]]) }]]) } as unknown as Room;
    setRemoteVoices(room, false);
    for (const v of [a, b, c]) {
      expect(v.setEnabled).toHaveBeenLastCalledWith(false);
      expect(v.track.mediaStreamTrack.enabled).toBe(false);
    }
    setRemoteVoices(room, true);
    for (const v of [a, b, c]) {
      expect(v.setEnabled).toHaveBeenLastCalledWith(true);
      expect(v.track.mediaStreamTrack.enabled).toBe(true);
    }
  });

  it("a voice not subscribed yet is switched on the server only", () => {
    const pub = { kind: "audio", track: undefined, setEnabled: jest.fn() };
    const room = { remoteParticipants: new Map([["x", { audioTrackPublications: new Map([["1", pub]]) }]]) } as unknown as Room;
    expect(() => setRemoteVoices(room, false)).not.toThrow();
    expect(pub.setEnabled).toHaveBeenCalledWith(false);
  });
});
