import { getTeachersByState, getTeachersForState, getTeacherLocationStates } from "../location";

describe("getTeachersByState", () => {
  it("groups teachers by state", () => {
    const groups = getTeachersByState();
    expect(groups.length).toBeGreaterThan(0);
    for (const g of groups) {
      expect(g.state).toBeTruthy();
      expect(g.slug).toBeTruthy();
      expect(g.teachers.length).toBeGreaterThan(0);
      // Every teacher in the group should match the state
      for (const t of g.teachers) {
        expect(t.state).toBe(g.state);
      }
    }
  });

  it("produces lowercase hyphenated slugs", () => {
    const groups = getTeachersByState();
    for (const g of groups) {
      expect(g.slug).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
});

describe("getTeachersForState", () => {
  it("returns teachers for california", () => {
    const group = getTeachersForState("california");
    expect(group).toBeDefined();
    expect(group!.state).toBe("California");
    expect(group!.teachers.length).toBeGreaterThan(0);
  });

  it("returns undefined for non-existent state", () => {
    expect(getTeachersForState("nonexistent")).toBeUndefined();
  });
});

describe("getTeacherLocationStates", () => {
  it("returns state/slug pairs", () => {
    const states = getTeacherLocationStates();
    expect(states.length).toBeGreaterThan(0);
    expect(states[0]).toHaveProperty("state");
    expect(states[0]).toHaveProperty("slug");
  });
});
