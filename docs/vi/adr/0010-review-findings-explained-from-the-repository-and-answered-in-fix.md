---
title: "ADR 0010: finding của một review được giải thích từ repository, và được trả lời lần lượt từng cái trong atk:fix"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-23
updated: 2026-10-24
ticket: none
---

# ADR 0010: finding của một review được giải thích từ repository, và được trả lời lần lượt từng cái trong atk:fix

Design: `docs/records/design/261023-1609-review-findings-explained-and-answered.md`

Thay thế `docs/adr/0007-plain-explanation-of-a-document-is-a-catchup-mode.md`. Chỉ một quyết định của ADR 0007 thay đổi: với review report, câu "Mọi điều trang nói đều truy
được về một chỗ trong tài liệu" không còn đúng. Mọi quyết định khác của ADR 0007 vẫn giữ nguyên.

## Bối cảnh

Ngày 2026-10-22, `atk:review` đăng 35 finding lên pull request của một dự án khách hàng. Người viết
không hiểu các finding đó. Trong một phiên `atk:fix`, finding nào cũng phải được giải thích rồi mới
quyết được, theo bốn hướng:

- một kịch bản có nhân vật được gọi tên;
- chuyện đó có xảy ra trong thực tế không;
- vì sao code lại được viết như vậy;
- cách sửa được đề xuất thật ra tốn bao nhiêu.

Hướng nào cũng cần tới repository: đoạn code được trích, một quyết định trong plan, đặc tả nghiệp vụ,
pipeline deploy.

Document mode của `atk:catchup` sẽ không trả lời được hướng nào, vì ADR 0007 giới hạn trang trong
đúng lời của tài liệu. Mode đó cũng không đọc được một review chỉ có trên pull request. `atk:fix`
không có đường nào cho nhiều finding cùng lúc, nên phiên đã tự nghĩ ra một cách phân loại và một file
quyết định nằm ngoài mọi path của kit.

## Quyết định

- **Phần giải thích.** Với `review-report`, document mode thêm cho mỗi finding một lớp có nhãn,
  What the repository says: một kịch bản, chuyện đó có xảy ra trong thực tế không, vì sao code như
  vậy, và cách sửa tốn bao nhiêu, có đánh dấu chỗ khác với report.
  - Lớp này chỉ đọc một danh sách chỗ cố định: các dòng được trích, một record mà dòng `Decision` của
    finding nêu tên, plan hay design mà thay đổi nêu tên, các tài liệu tham chiếu mà code được trích
    phục vụ, một file cấu hình mà finding nêu tên, và định nghĩa của thứ các dòng được trích dùng tới,
    cách một bước và không xa hơn.
  - Path của plan hay design lấy từ phần thân pull request chỉ được mở khi nó nằm trong thư mục plan
    hay design của repository.
  - Lớp này được đọc tại commit đã được review, hoặc nói rõ đã đọc commit nào thay vào đó.
  - Mỗi dòng trích `path:line`, hoặc ghi "the repository does not say". Mọi thứ lớp này in ra đều được
    che, và finding về credential không có lớp này.
  - Trang vẫn không thêm finding, mức độ hay phán quyết nào.
  - Mọi loại record khác giữ quy tắc của ADR 0007, kể cả `security-record`: record đó vốn đã kiểm
    từng finding với code, và một kịch bản viết cho lỗ hổng chưa sửa có thể đi vào chi tiết sâu hơn
    chính record.
- **Review đã đăng.** `/atk:catchup <pr-url> --findings` giải thích review `atk:review` mới nhất được
  đăng trên pull request. Nó đọc review theo đúng cách `atk:review` đọc một review trước đó, và chỉ
  tính một bản tóm tắt khi người viết bản đó khớp với một người trong phần Team, hoặc được người đang
  chạy skill xác nhận. `<pr-url>` không kèm cờ vẫn là brief về diff.
- **Phân loại.** `/atk:fix <pr-url | review report> --findings` tự gọi phần giải thích, rồi cùng người
  viết đi qua từng finding một, trả lời các câu hỏi thêm từ cùng những nguồn đó.
  - Người đó trả lời mỗi finding bằng một trong bốn loại mà `atk:review` đọc lại: fixed, deferred,
    declined hoặc disputed. Finding chưa ai trả lời được thì được đăng dưới dạng deferred, chỗ hoãn
    tới là người và câu hỏi mà nó đang chờ. "Skip" được ghi là declined. Một từ nằm ngoài bốn loại sẽ
    bị review sau đọc thành chưa có câu trả lời.
  - Mỗi câu trả lời là một dòng `gate`.
  - Câu trả lời trên từng luồng bình luận được soạn nháp riêng, đã che, chỉ chứa câu trả lời, lý do và các path,
    và chỉ được đăng khi người đó đồng ý. Câu trả lời `fixed` phải chờ tới khi push. Finding về
    credential không có câu trả lời nào. Bảng đồng ý có thêm dòng tương ứng.
  - Các finding cần sửa đi vào các bước 1 tới 7 như lỗi của lần chạy này, mỗi dòng `Fix` là một nhận
    định cần kiểm, và trần giả thuyết được đếm riêng cho từng finding. Các bản sửa được commit lên
    chính branch của pull request: không có pull request thứ hai, và phần thân do người viết soạn
    không bao giờ bị thay.
  - Các câu trả lời nằm trong progress log, trong mục Findings answered của fix report, vốn luôn được
    ghi khi có cờ này, và trên luồng bình luận. Không thêm loại artifact mới nào.

## Hệ quả

- Không có skill mới, nên con số vẫn là 25. `atk:catchup` và `atk:fix` mỗi skill có thêm một cờ.
  `atk:fix` có thêm một file trong `references/`, và report của nó có thêm một mục.
- Một trang về review tốn công viết hơn, vì nó đọc repository. Phần đọc được giao cho agent đọc rộng,
  và danh sách giới hạn phạm vi của nó.
- Trang chứa những nhận định mà reviewer chưa từng đưa ra. Chúng có nhãn, có trích dẫn và nằm dưới
  tiêu đề riêng, nên người đọc phân biệt được lời của reviewer với phần lần chạy tự đọc ra.
- Các câu trả lời quay về với lần `atk:review` sau mà cách đọc của `atk:review` không phải đổi gì, vì
  chúng thuộc bốn loại của nó.
- `/atk:catchup <review-report-path>` thay đổi từ bản phát hành này mà không cần cờ, và ghi chú phát hành
  nói rõ điều đó.
- Các câu trả lời đã đăng vẫn còn sau khi kit được rollback: các review sau vẫn đọc chúng là câu trả
  lời.
- Một finding đang chờ ai đó sẽ hiện ra trong review sau dưới dạng `deferred`, không phải đang chờ;
  người và câu hỏi nằm trong dòng `Author` của nó, và nhờ vậy `atk:review` không phải đổi.
- ADR 0007 và design của nó được đánh dấu `SUPERSEDED`, có link hai chiều, trong pull request đưa
  quyết định này vào.

## Các phương án bị loại

- **Giữ trang trong phạm vi report.** Đây chính là cách đã thất bại. Câu hỏi của người đọc đều nhận
  lại "the document does not say".
- **Chỉ đọc repository ở bước phân loại.** Phần giải thích sẽ bị tách ra hai skill, và trang mà Tech
  Lead đọc để phân xử một tranh chấp sẽ là trang yếu hơn.
- **Nhận anchor URL của một review là document mode.** Cách này cần một ngoại lệ trong bước nhận diện loại
  đầu vào, và anchor đó chỉ có trên GitHub. Một cờ thì chạy được trên mọi host mà
  `shared/ticket-adapters.md` đọc được.
- **Phân loại là một mode của `atk:review`.** `atk:review` là skill của reviewer, và reviewer không bao
  giờ là người viết. Skill đó cũng không viết code, nên các finding cần sửa vẫn phải chuyển sang
  `atk:fix`.
- **Một skill riêng.** Phải sửa mọi nhóm của `CONV-001`, thêm skill thứ 26, và skill đó lại trích lại
  phần đọc luồng bình luận, bước kiểm tra ý định, trần giả thuyết và report mà `atk:fix` đã có.
- **Một file quyết định riêng, dưới `docs/records/` hay `docs/derived/`.** Nó sẽ là bản sao thứ tư của
  những câu trả lời mà luồng bình luận, progress log và fix report đã giữ, và là một loại mới trong tài liệu về
  vòng đời artifact.
