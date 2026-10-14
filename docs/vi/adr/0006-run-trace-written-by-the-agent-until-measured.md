---
title: "ADR 0006: agent tự ghi run trace cho tới khi đo được rằng script không hỏi quyền nhiều hơn"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-14
updated: 2026-10-14
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-14, by instruction to the agent.

# ADR 0006: agent tự ghi run trace cho tới khi đo được rằng script không hỏi quyền nhiều hơn

Design: `docs/records/design/261014-0335-run-trace-writer.md`

## Bối cảnh

Theo ADR 0005, agent tự ghi mọi dòng của run trace, làm theo `shared/run-trace.md`. Đo ngày
2026-10-14, định dạng chỉ đúng sau khi file đó được siết lại, và `way` luôn là `session` trong mọi
lượt chạy không tương tác, vì agent không phân biệt được một prompt chạy nền với một người gõ lệnh.
Giờ một skill của `atk` được phép mang script Node. Một script thử nghiệm ghi trace đúng định dạng, và
đọc được `way` từ `CLAUDE_CODE_ENTRYPOINT`, nhưng mỗi lần gọi nó là một lệnh shell, và chế độ
default của Claude Code hỏi quyền cho từng lệnh shell.

## Quyết định

- **Agent vẫn là bên ghi trace** trong bản phát hành mang run trace. Ở chế độ default, nó hỏi một lần
  mỗi phiên, và là cách ghi duy nhất đã đo trên Codex.
- **Một script trong `plugins/atk/shared/` chỉ thay thế agent về sau nếu** một phiên Claude Code tương
  tác ở chế độ default, chạy `atk:help` và `atk:plan` với script, hỏi quyền không quá một lần trong
  phiên. Khi đó agent vẫn là đường dự phòng ở máy không có `node` trên `PATH`.

## Hệ quả

- Trong bản phát hành này, `way` vẫn là lời tự khai của lượt chạy, như `shared/run-trace.md` đã ghi.
- Một trace sai định dạng được `atk:tailor --feedback --runs` báo ra, chứ không bị chặn từ đầu.
- Mỗi lượt chạy có trace vẫn đọc `shared/run-trace.md`, khoảng 3.400 token.
- Trong bản phát hành này, không skill nào nhờ agent chạy một script của kit.

## Phương án tạm thời bị loại

- **Script ghi mọi dòng, ngay bây giờ.** Chưa đo được số lần hỏi quyền của nó trong phiên tương tác,
  và đằng nào nó cũng cần agent làm đường dự phòng, tức hai bên cùng ghi một định dạng.
- **Script mở trace, agent ghi tiếp các dòng sự kiện.** Ở chế độ default, một lệnh shell và một lần
  ghi file là hai lần hỏi, vượt giới hạn người duy trì kit đã đặt, và agent vẫn phải đọc định dạng.
- **Một script chỉ để kiểm tra trace.** Kiểm tra sau khi ghi chỉ phát hiện trace sai chứ không ngăn
  được, và `atk:tailor --feedback --runs` đã báo trace sai rồi.
