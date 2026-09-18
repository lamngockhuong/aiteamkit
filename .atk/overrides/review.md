---
title: atk:review overrides
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-18
updated: 2026-09-18
ticket: none
---

Chỉ đúng với repo này, không mang sang dự án khác.

Các luật về nội dung repo không nằm ở đây. Chúng là những dòng `CONV-NNN` trong mục "Review
checklist" của `CLAUDE.md`, do `/atk:convention` ghi, và `atk:review` đã đọc mục đó theo
`shared/review-checklist.md`. File này chỉ giữ phần nói về cách skill làm việc, thứ không ai kiểm
được nếu không cài kit.

## After

Diff chạm khối lệnh kiểm tra trong `CLAUDE.md` thì phải chạy thử đúng khối đó, không đọc bằng mắt
rồi kết luận. Một khối lệnh sai cú pháp trông vẫn hợp lý trên màn hình, và người tin nó là người
sau. Lệnh không chạy được ghi ở mức BLOCKING, gắn nhãn `[atk-kit]`.

Điều này áp cho cả những lệnh mà một dòng `CONV-NNN` trỏ tới: dòng đó nói luật, còn đây nói rằng
kiểm nó bằng cách chạy chứ không bằng cách đọc.
