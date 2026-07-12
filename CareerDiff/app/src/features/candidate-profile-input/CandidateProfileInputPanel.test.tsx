import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { CandidateProfileInputPanel } from "./CandidateProfileInputPanel";

function ControlledPanel() {
  const [value, setValue] = useState("");
  const [targetSeniority, setTargetSeniority] = useState("");
  return (
    <CandidateProfileInputPanel
      value={value}
      onChange={setValue}
      targetSeniority={targetSeniority}
      onTargetSeniorityChange={setTargetSeniority}
    />
  );
}

describe("CandidateProfileInputPanel", () => {
  it("blocks an empty profile by showing a validation message after the field is touched (docs/features/02)", async () => {
    const user = userEvent.setup();
    render(<ControlledPanel />);

    const textarea = screen.getByLabelText("이력서 / 커리어 / 프로젝트");
    await user.click(textarea);
    await user.tab();

    expect(await screen.findByRole("alert")).toHaveTextContent("이력서/커리어 정보를 입력해 주세요.");
  });

  it("shows the sensitive-data warning at all times (docs/features/02 UI contract)", () => {
    render(<ControlledPanel />);
    expect(screen.getByText("비밀번호, 토큰, 사내 전용 식별자 등 민감 정보는 붙여넣지 마세요.")).toBeInTheDocument();
  });

  it("shows no validation message once enough text is entered", async () => {
    const user = userEvent.setup();
    render(<ControlledPanel />);

    const textarea = screen.getByLabelText("이력서 / 커리어 / 프로젝트");
    await user.type(textarea, "a".repeat(40));
    await user.tab();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
