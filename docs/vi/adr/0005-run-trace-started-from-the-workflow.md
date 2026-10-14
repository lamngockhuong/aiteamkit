---
title: "ADR 0005: run trace được khởi động bằng một dòng trong workflow của mọi skill, và được giữ ngoài git bằng một file ignore trong chính thư mục của nó"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-13
updated: 2026-10-14
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-14, by instruction to the agent.

# ADR 0005: run trace được khởi động bằng một dòng trong workflow của mọi skill, và được giữ ngoài git bằng một file ignore trong chính thư mục của nó

Design: `docs/records/design/261013-2358-run-trace-reached-from-the-workflow.md`

Thay thế `docs/adr/0004-every-skill-leaves-a-run-trace.md`. Mọi quyết định của ADR 0004 vẫn giữ
nguyên, trừ hai quyết định dưới đây.

## Bối cảnh

ADR 0004 đặt nghĩa vụ để lại run trace chỉ trong nguyên tắc 10 của
`plugins/atk/shared/team-roles.md`, và giữ trace ngoài git bằng một dòng trong `.git/info/exclude`
của bản clone. Cả hai đều hỏng khi thử ngày 2026-10-13:

- `/atk:help` chạy hai lần trên hai model, không lần nào mở `team-roles.md` và không ghi trace, dù
  chính `SKILL.md` của nó có nhắc tới nguyên tắc 10.
- Claude Code không cho một lượt chạy không tương tác sửa `.git/info/exclude`, nên một lượt chạy
  trong subagent hay trong pane không bao giờ qua được bước kiểm tra bắt buộc trước khi ghi trace.

## Quyết định

- **Mọi `SKILL.md` mở đầu workflow bằng một dòng khởi động trace**, ngay dưới dòng override: tạo
  trace của lượt chạy này tại đường dẫn của nó, rồi làm theo `shared/run-trace.md` trước khi ghi
  file, ở mỗi bước, và lúc kết thúc. Nguyên tắc 10 vẫn là nghĩa vụ, và vẫn là điều thứ mười mà một
  file override không gỡ được.
- **Trace được giữ ngoài git bằng `<docs root>/derived/traces/.gitignore` chứa `*`.** File này thắng
  một dòng phủ định trong `.gitignore` ở gốc dự án, tự bỏ qua chính nó, và nằm trong cây làm việc
  nên một lượt chạy không tương tác ghi được. Lệnh `git check-ignore -q` trước khi ghi trace vẫn bắt
  buộc.

## Hệ quả

- **Trace được ghi ra** trong lượt chạy nháp đã thử: một trace 8 dòng, 520 byte, không gì bị đưa vào
  stage.
- **Mỗi `SKILL.md` thêm hai dòng**, tổng cộng 48 dòng trong kit; `review` và `verify` đang ở 299 dòng
  nên phải bớt mỗi file hai dòng để vẫn dưới 300.
- **Một skill mới phải có dòng này**, và `CLAUDE.md` ghi điều đó ở chỗ liệt kê những gì một skill
  phải khớp.
- **Không có gì được ghi vào thư mục git** vì trace. Progress log thì vẫn ghi, và gặp cùng rủi ro
  trong một lượt chạy không tương tác; điều đó không đổi ở đây.

## Phương án bị loại

- **Chỉ có nguyên tắc 10, hoặc nhắc tới nó trong văn bản của skill.** Không được đọc, hai trên hai
  lượt chạy.
- **Kéo dài dòng override để trỏ tới file trace.** Nửa về override được làm, nửa về trace thì không.
- **Một hook khởi động trace.** Hook không chạy khi người dùng gõ slash command hay trên Cursor, và
  một hook không được là con đường duy nhất dẫn tới một hành vi.
- **Viết cả quy trình vào mọi `SKILL.md`.** Hai mươi bốn bản sao, và hai skill đã chạm trần.
- **File exclude cục bộ.** Lượt chạy không tương tác bị từ chối.
- **Đặt trace ngoài repository.** Mất khỏi dự án, nơi `atk:tailor --feedback --runs` đọc.
