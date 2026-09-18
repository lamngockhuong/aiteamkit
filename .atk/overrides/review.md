---
title: atk:review overrides
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-18
updated: 2026-09-18
ticket: none
---

Chỉ đúng với repo này, không mang sang dự án khác: cả bốn hạng mục dưới đây nói về một bộ kit gồm
Markdown và manifest, không nói về một ứng dụng.

## After

Kit này chỉ có Markdown và manifest, nên thêm bốn hạng mục vào phần findings:

1. Mọi con số đếm trong tài liệu (số skill, số file `shared/`, số nguyên tắc) phải khớp với thực tế
   trên đĩa. Lệch một con số ghi ở mức BLOCKING, vì nó là thứ người đọc tin ngay mà không kiểm.
2. Mỗi thay đổi trong `docs/` phải có bản đối ứng trong `docs/vi/` cùng nội dung. Thiếu ghi ở mức
   BLOCKING.
3. Diff chạm khối lệnh kiểm tra trong `CLAUDE.md` thì phải chạy thử đúng khối đó, không đọc bằng mắt
   rồi kết luận. Một khối lệnh sai cú pháp trông vẫn hợp lý trên màn hình, và người tin nó là người
   sau. Lệnh không chạy được ghi ở mức BLOCKING.
4. Diff thêm, đổi tên hoặc bỏ một skill thì phải chạm đủ chín nhóm file mà mục "Adding or changing a
   skill touches several files" trong `CLAUDE.md` liệt kê. Thiếu nhóm nào ghi ở mức BLOCKING, kèm tên
   nhóm còn thiếu.

Gắn nhãn `[atk-kit]` cho cả bốn.
