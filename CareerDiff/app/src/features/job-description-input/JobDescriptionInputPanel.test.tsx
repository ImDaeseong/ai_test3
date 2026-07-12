import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { JobDescriptionInputPanel } from "./JobDescriptionInputPanel";

function ControlledPanel() {
  const [value, setValue] = useState("");
  const [targetRole, setTargetRole] = useState("");
  return (
    <JobDescriptionInputPanel
      value={value}
      onChange={setValue}
      targetRole={targetRole}
      onTargetRoleChange={setTargetRole}
    />
  );
}

describe("JobDescriptionInputPanel", () => {
  it("blocks empty input by showing a validation message after the field is touched", async () => {
    const user = userEvent.setup();
    render(<ControlledPanel />);

    const textarea = screen.getByLabelText("채용공고");
    await user.click(textarea);
    await user.tab();

    expect(await screen.findByRole("alert")).toHaveTextContent("채용공고를 입력해 주세요.");
  });

  it("shows a too-short message instead of the empty message once text is typed", async () => {
    const user = userEvent.setup();
    render(<ControlledPanel />);

    const textarea = screen.getByLabelText("채용공고");
    await user.type(textarea, "short text");
    await user.tab();

    expect(await screen.findByRole("alert")).toHaveTextContent("최소 30자 이상 입력해 주세요.");
  });

  it("shows no validation message once enough text is entered", async () => {
    const user = userEvent.setup();
    render(<ControlledPanel />);

    const textarea = screen.getByLabelText("채용공고");
    await user.type(textarea, "a".repeat(40));
    await user.tab();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
