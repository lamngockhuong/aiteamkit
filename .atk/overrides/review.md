---
title: atk:review overrides
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-18
updated: 2026-09-18
ticket: none
---

## After

Kit này chỉ có Markdown và manifest, nên thêm hai hạng mục vào phần findings:

1. Mọi con số đếm trong tài liệu (số skill, số file `shared/`, số nguyên tắc) phải khớp với thực tế
   trên đĩa. Lệch một con số ghi ở mức BLOCKING, vì nó là thứ người đọc tin ngay mà không kiểm.
2. Mỗi thay đổi trong `docs/` phải có bản đối ứng trong `docs/vi/` cùng nội dung. Thiếu ghi ở mức
   BLOCKING.

Gắn nhãn `[atk-kit]` cho cả hai.
