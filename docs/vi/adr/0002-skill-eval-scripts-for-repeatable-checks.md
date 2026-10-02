---
title: "ADR 0002: atkx:skill-eval đặt các phép kiểm tra cần lặp lại trong script Node"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-01
updated: 2026-10-01
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-01, by instruction to the agent.

# ADR 0002: atkx:skill-eval đặt các phép kiểm tra cần lặp lại trong script Node

Design: `docs/records/design/261001-1510-atkx-skill-eval.md`

## Bối cảnh

`atkx:skill-eval` đánh giá một skill qua sáu phần: kiểm tra tĩnh kèm cổng an toàn, đối chiếu với quy
ước riêng của dự án, đo trigger trên Claude Code, soạn nháp case trigger, xem lại một lượt chạy, và
cho một điểm tổng. Các skill mẫu đi kèm phải nhận cùng một kết luận ở mọi lần chạy, để khi một thay
đổi trong bộ đánh giá làm nó chấm sai thì phát hiện được ngay.

Mọi skill hiện có trong kit đều chỉ gồm chỉ dẫn. Mã duy nhất kit phân phối là hai hook Node, chọn Node vì
nó chạy giống nhau trên Linux, macOS và Windows. Phương pháp đo trigger mà repository tin cậy chưa có
runner nào được giữ lại: mã được dán thẳng vào `docs/trigger-eval-measurement.md`, và mỗi lần đo lại
phải dựng lại bằng tay.

## Quyết định

Những phép kiểm tra cần ra cùng kết quả mỗi lần được viết thành script Node trong
`plugins/atkx/skills/skill-eval/scripts/`: kiểm tra tĩnh và cổng an toàn, runner đo trigger cùng hook
của nó, và phần tính điểm. Những phép kiểm tra cần phán đoán thì agent làm, mỗi phần theo một tệp
tham chiếu: quy ước của dự án, soạn nháp case, xem lại một lượt chạy, viết báo cáo. Trên máy không có
Node, mọi chế độ trừ đo trigger được làm bằng tay theo các tệp tham chiếu đó, và báo cáo ghi rõ điều
này.

## Hệ quả

- Kết luận cho các skill mẫu trở thành một lệnh người bảo trì chạy được, nằm cùng các lệnh kiểm chứng
  khác của repository.
- `skill-eval` là skill đầu tiên trong cả hai kit có thư mục `scripts/`. `CLAUDE.md` cho phép điều này
  với `atkx`, chỉ bằng Node, và chỉ cho những phép kiểm tra cần lặp lại.
- Runner đo trigger nằm trong skill, nên `docs/trigger-eval-measurement.md` trỏ sang đó thay vì giữ
  một bản mã riêng.
- Bốn script được duy trì cạnh các tệp tham chiếu, bằng runtime mà kit vốn đã yêu cầu.

## Các phương án bị loại

- **Chỉ dùng chỉ dẫn, như mọi skill khác.** Khi agent tự làm, việc che giá trị bí mật, đối chiếu tên
  host và đếm kết quả của sáu mươi phiên con sẽ khác nhau giữa các lần chạy. Kết luận cho skill mẫu
  khi đó đúng hay sai là nhờ may, và mọi phiên con đều chiếm chỗ trong ngữ cảnh của agent.
- **Script Python.** Lặp lại được như Node, nhưng là runtime thứ hai mà kit không cần ở chỗ nào khác,
  và Windows mặc định không có.
