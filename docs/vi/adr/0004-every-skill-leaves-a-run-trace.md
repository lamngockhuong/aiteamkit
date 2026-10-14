---
title: "ADR 0004: mọi skill atk mặc định để lại một run trace, và atk:tailor --feedback đọc được nhiều run trace"
status: SUPERSEDED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-11
updated: 2026-10-14
ticket: none
---

Bị thay thế ngày 2026-10-14 bởi `docs/adr/0005-run-trace-started-from-the-workflow.md`, ADR đổi cách một lượt chạy bắt đầu ghi trace và cách giữ trace ngoài git; mọi quyết định khác ở đây vẫn giữ nguyên.

# ADR 0004: mọi skill atk mặc định để lại một run trace, và atk:tailor --feedback đọc được nhiều run trace

Design: `docs/records/design/261011-1626-run-trace.md`

## Bối cảnh

`atk:tailor --feedback` biến một lần chạy có vấn đề thành một override, một bản ghi gửi tác giả
skill, hoặc không thành gì. Nó chỉ đọc được lần chạy trong phiên hiện tại. Các lần chạy trong
subagent, trong CLI của agent khác, hay trong phiên trước đó không để lại gì để đọc, mà
`atk:orchestrate` sẽ tạo ra nhiều lần chạy như vậy cùng lúc. Người bảo trì muốn có dữ liệu từ mọi lần
chạy, bật mặc định và tắt theo từng dự án.

Ba skill đã ghi nhật ký tiến độ, nhưng nhật ký đó chứa những gì cần để chạy tiếp, không phải những gì cần để
phân tích. `atk:run-cases` cũng đã dùng tên "run log" cho nhật ký riêng của nó.

## Quyết định

- **Mỗi lần chạy để lại một run trace.** Đó là một file thuộc nhóm Derived tại
  `<docs root>/derived/traces/<skill>/<run-id>.md`, mỗi dòng theo dạng cố định ghi một sự kiện quan
  sát được:
  - một bước đã chạy hoặc bị bỏ qua;
  - một câu hỏi, người được hỏi, và thời gian chờ;
  - một ngưỡng đã chặn lần chạy;
  - số lỗi review tìm ra;
  - một chỗ người dùng báo đã sửa tay;
  - điểm kết thúc của lần chạy.
- **Quy tắc và hình dạng nằm trong `shared/`.** Quy tắc là quy tắc 10 của
  `plugins/atk/shared/team-roles.md`. Hình dạng, những gì không bao giờ được ghi, và việc giữ hai mươi
  trace cho mỗi skill nằm trong file mới `plugins/atk/shared/run-trace.md`.
- **Bật mặc định.** Profile không có dòng này, hoặc dự án chưa có profile, đều được coi là bật.
  `Run trace: off` trong `.atk/profile.md` tắt cho cả dự án. Không có cách tắt cho từng lần chạy.
- **Không bao giờ vào commit.** Trace được loại khỏi git bằng một bước kiểm tra bắt buộc. Nếu bước
  kiểm tra đó thất bại, lần chạy không ghi trace.
- **`atk:tailor --feedback` có thêm `--runs`.** Nó đọc nhiều trace của một skill, đếm các mẫu lặp lại,
  và đưa từng mẫu qua phép phân loại sẵn có.
- **`atk:orchestrate` giữ trace của các job.** Nó chép trace của mỗi job ra khỏi worktree của job đó
  trước khi xoá worktree.

## Hệ quả

- **Các lần chạy không ai trông vẫn cải thiện được dựa trên bằng chứng.** Trong đó có các lần chạy của
  `atk:orchestrate`.
- **Mỗi lần chạy tốn thêm vài dòng ghi chép**, kể cả ở nhóm không bao giờ đọc trace. Chi phí này được
  đo trước khi phát hành và ghi trong `shared/run-trace.md`.
- **"Chín quy tắc" thành "mười quy tắc"** trong `CLAUDE.md`, `docs/system-architecture.md`,
  `docs/codebase-summary.md`, và các bản tiếng Việt của chúng.
- **`.atk/profile.md` có dòng thứ hai làm thay đổi hành vi**, bên cạnh `Contract`.
- **Git không bao giờ mang theo trace, nhưng thư mục docs gốc thì có.** Một trình sinh tài liệu,
  một bản lưu trữ hay một bước build image đọc thư mục docs gốc cũng đọc luôn các trace, trừ khi dự án
  loại `derived/` ra. Những gì `tailor` gửi về kit đều được viết trung tính theo `CONV-010`, và chỉ
  khi người dùng yêu cầu.

## Các phương án bị loại

- **Giữ nguyên `tailor --feedback`.** Nó không thấy được các lần chạy không ai trông.
- **Một skill nhật ký gọi sau mỗi lần chạy.** Không ai gọi nó sau hàng chục job. Văn xuôi của nó không
  đếm được, và nó trùng với phần phán đoán `tailor` đang làm.
- **Đọc bản ghi hội thoại của harness.** Bản ghi đó chứa những thứ quy tắc 9 cấm đọc, và mỗi harness một định
  dạng.
- **Để hook ghi trace.** Hook không bao giờ giữ quy tắc, không thấy được các bước của skill, và không
  chạy trên mọi harness.
- **Cách tắt cho từng lần chạy.** Người bảo trì loại phương án này ngày 2026-10-11. Xoá một trace thuộc
  nhóm Derived cho kết quả tương tự mà không tốn gì.
