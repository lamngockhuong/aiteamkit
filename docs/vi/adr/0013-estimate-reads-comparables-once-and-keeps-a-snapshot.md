---
title: "ADR 0013: atk:estimate đọc dữ liệu đối chiếu một lần mỗi lần chạy, có giới hạn, và giữ một snapshot có ngày"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-03
updated: 2026-11-03
ticket: none
---

# ADR 0013: atk:estimate đọc dữ liệu đối chiếu một lần mỗi lần chạy, có giới hạn, và giữ một snapshot có ngày

Design: `docs/records/design/261103-0629-estimate-comparables-read-once.md`

## Bối cảnh

Bước 2 của `atk:estimate` đọc tracker để tìm các item đã đóng giống item đang ước lượng, nhưng không
giới hạn đọc bao nhiêu, đọc mấy lần, hay làm gì khi tracker không trả lời. Trên GitHub, actual time là
một number field của Project mà issue search không lọc được, nên mỗi lần chạy phải phân trang cả
Project, và lặp lại cho từng item cần ước lượng. Ngày 2026-11-03, maintainer báo rằng việc này tốn số
lần query và thời gian chờ, và không trụ được khi GitHub gặp sự cố hoặc khi ước lượng nhiều task cùng
lúc.

## Quyết định

- **Một lần mỗi lần chạy.** Bước 2 đọc tập item đã đóng một lần, trước khi đối chiếu, và đối chiếu mọi
  item với tập đó.
- **Có giới hạn.** Lần đọc chỉ gồm các item đã đóng có ghi actual, chỉ với các field việc đối chiếu
  cần, và do tracker lọc ở phía nó khi tracker lọc được. Lần đọc không bị cắt theo ngày: ngày thay đổi
  cách làm việc mà override ghi lại giữ vai trò giới hạn confidence của một mẫu khi đối chiếu (đổi
  trong review, R1 của design).
- **Một snapshot có ngày.** Tập này được giữ tại
  `<docs root>/derived/estimate/comparables-<tracker>-<project>.tsv`, mỗi tracker và project một
  file, được giữ ngoài git bằng một ignore file chứa `*` sau ba bước kiểm tra phạm vi mà run trace
  dùng, title và label được che theo rule 9 và bỏ ký tự điều khiển, và được thay nguyên file qua một
  file tạm đặt tên theo lần chạy. Lần chạy sau đọc những gì thay đổi kể từ ngày của nó, lùi lại một
  ngày, và các key của tập đang lọc, rồi bỏ những gì đã ra khỏi; trên tracker không có bộ lọc theo
  ngày cập nhật thì đọc toàn bộ. Một lần đọc chỉ được tính khi đủ mọi trang.
- **Dự phòng chỉ cho sự cố.** Khi tracker không kết nối được hoặc quá thời gian, lần chạy dùng
  snapshot, và sheet ghi ngày của nó ở Appendix B và C. Với forbidden, not found hay đăng nhập hết hạn
  thì không dùng, vì đó có thể là quyền đã bị thu hồi.

## Hệ quả

- Số lần gọi tracker để lấy dữ liệu đối chiếu không còn tăng theo số item được ước lượng.
- Có thêm một loại derived mới, không bao giờ được stage, mà `shared/artifact-paths.md` và
  `docs/artifact-lifecycle.md` liệt kê và đếm.
- Một estimate làm từ snapshot thì rõ ràng là cũ hơn estimate làm từ tracker, và người chấp nhận
  estimate quyết định có chạy lại hay không.
- Trên GitHub, `ProjectV2.items(query:)` lọc được theo trạng thái đóng, theo một number field gọi bằng
  slug và theo thời điểm cập nhật của item trong Project, đo ngày 2026-11-03. Với một qualifier nó
  không biết, nó trả về không item nào chứ không báo lỗi, nên kết quả không trong khi chỉ `is:closed`
  vẫn trả về item là một bộ lọc hỏng, và không bỏ gì khỏi snapshot.
- Các lần chạy ở các working tree khác nhau giữ snapshot riêng, nên mỗi cái tự trả lần đọc toàn bộ đầu
  tiên của mình.

## Các phương án bị loại

- **Đọc theo từng item, như hiện nay.** Chính là vấn đề được báo.
- **Người dùng tự chỉ ra các item đối chiếu.** Đổi số query lấy thời gian của một người, và bỏ mất
  việc tìm kiếm mà bước này sinh ra để làm.
- **Chỉ đọc các item đóng sau ngày thay đổi cách làm việc.** Ngày đó giới hạn mức một mẫu đỡ được,
  chứ không loại mẫu, nên cắt từ lúc đọc là bỏ những item đối chiếu sheet vẫn dùng được ở mức
  dưới `HIGH`; phần lớn dự án không ghi ngày; và snapshot đã khiến lần đọc toàn bộ chỉ tốn một lần. Được
  chọn lúc đầu, bị thay trong review.
- **Một khoảng thời gian gần đây cố định do kit chọn.** Một khoảng mà không ai trong đội chọn, và các
  mẫu nằm ngoài khoảng đó biến mất mà sheet không nói vì sao.
- **Không có snapshot.** Không giải quyết trường hợp sự cố, và lần chạy nào cũng trả giá một lần đọc
  toàn bộ.
- **Một snapshot được commit, dùng chung cả đội.** Lần chạy estimate nào cũng để lại một diff cần
  review, và một bản cũ trên `main` trông như bản hiện hành với mọi người pull về.
