---
title: "ADR 0014: benchmark của bộ kit là một bộ chạy riêng trong tests/bench/"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-05
updated: 2026-11-05
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-05, by instruction to the agent.

# ADR 0014: benchmark của bộ kit là một bộ chạy riêng trong tests/bench/

Design: `docs/records/design/261105-0300-atk-benchmark.md`

## Bối cảnh

Repository kiểm tra được file của nó có đúng hình dạng không và một câu yêu cầu đến skill nào. Chưa có
gì đo được một skill có làm tốt việc của nó không, có dừng đúng chỗ một người phải quyết định không,
và bộ kit có làm tốt hơn cùng model đó khi không có kit không. Skill dừng lại chờ duyệt, nên benchmark
phải đóng vai người giữa các bước mà không để skill tự duyệt sản phẩm của nó, điều rule 2 của
`plugins/atk/shared/team-roles.md` cấm.

## Quyết định

Một bộ chạy Node trong `tests/bench/`, ban đầu chỉ cho Claude Code, chạy các scenario trên một dự án
mẫu được dựng mới cho mỗi lần chạy. Mỗi scenario chạy N lần ở hai nhánh, có nạp `atk` và không nạp.
Giữa các lượt, một responder trả lời câu hỏi từ một fact sheet cố định và không bao giờ duyệt; giữa
các bước, bộ chạy duyệt artifact bằng cách sửa status của nó, như người duyệt tự sửa file, và đồng ý
commit hay push bằng một lượt nói từ người duyệt. Việc giữ gate, hidden test và trạng thái git được
kiểm tra bằng code; chất lượng artifact bằng một rubric do một model riêng chấm. Phần cô lập của bộ
chạy trigger trong `atkx:skill-eval` được dùng lại qua export, không chép.

## Hệ quả

- Không cài gì: fixture, hidden test và đáp án nằm ngoài cả hai plugin.
- Repository có kiểm tra đầu tiên tốn tiền để chạy; nó nằm ngoài `tests/verify.sh`.
- `trigger-run.mjs` export các hàm cô lập của nó, và CLI của nó phải chạy như trước.
- Benchmark phụ thuộc việc `claude -p --resume` giữ được câu hỏi của skill qua các lượt, đã đo là
  giữ được trên `atk:intake` ngày 2026-11-05 với Claude Code 2.1.318.
- Nó được chạy tay, tối đa ba lần mỗi scenario, và kết quả chỉ để tham khảo: không được commit và
  không chặn release nào.
- Codex và Cursor chưa được đo cho đến khi bộ chạy có driver cho chúng.

## Các phương án bị loại

- **`claude plugin eval`.** Nó có ablation có và không có plugin, nhưng không có lượt thứ hai theo
  kịch bản, nên không có chuỗi và không có phỏng vấn; không có grader chạy code, nên không có hidden
  test và không có trạng thái git; và case nằm dưới plugin, nên mọi lần cài đều chép fixture. Cần xem
  lại nếu những điều đó thay đổi.
- **Mode `--bench` của `atkx:skill-eval`.** Phạm vi của nó loại trừ việc đo một skill có và không có
  chính nó, nó đánh giá skill của một dự án chứ không phải bộ kit, và bản cài `atkx` sẽ mang theo
  fixture.
