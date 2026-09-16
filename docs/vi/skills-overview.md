# Tổng quan các skill

Mười hai skill, mỗi skill ứng với một chặng trong vòng đời delivery của team. Mỗi mục nói rõ skill
sinh ra gì, khi nào nên dùng, và khi nào không nên.

Nên đọc phần này trước khi áp dụng bộ kit: mỗi skill chạy độc lập được, và team có thể bắt đầu chỉ
với một skill.

## Vị trí trong vòng đời

```
intake -> estimate -> design-doc -> breakdown -> convention -> review -> qa -> release
                                                                                  |
                         onboard / handover (bất kỳ lúc nào)    incident <--------+
                                                                    |
                                                                  retro
```

---

## `atk:intake`

**Sinh ra.** Một tài liệu yêu cầu: trích nguyên văn yêu cầu gốc, mô tả hành vi hiện tại có dẫn đường
dẫn file, các user story, tiêu chí nghiệm thu dạng `Given / When / Then`, danh sách nằm ngoài phạm
vi, các giả định được đánh dấu rõ là giả định, và câu hỏi còn treo kèm tên người phải trả lời.

**Dùng khi.** Yêu cầu tới dưới dạng tin nhắn, biên bản họp, mail hoặc một ticket một dòng, và team
chưa bắt đầu được từ đó. Cũng dùng khi hai người đọc cùng một ticket mà hiểu khác nhau.

**Không dùng khi.** Yêu cầu đã chốt và đã viết ra; bạn cần con số ước lượng (`atk:estimate`) hoặc
hướng kỹ thuật (`atk:design-doc`).

**Thói quen tạo ra khác biệt.** Những tiêu chí kiểu "chạy đúng" hay "nhanh" bị từ chối chứ không
được ghi nhận cho qua. Chúng phải trở thành một con số, một trạng thái, một kết quả nhìn thấy được,
hoặc một câu hỏi còn treo.

---

## `atk:estimate`

**Sinh ra.** Ước lượng từng hạng mục kèm căn cứ và độ tin cậy, phần buffer rủi ro hiện rõ thành một
dòng riêng, bảng tính capacity trong đó ngày nghỉ và các buổi họp là những phép trừ tường minh, cam
kết sprint, và danh sách phần không nhét vừa.

**Dùng khi.** Họp sprint planning, khách hỏi mất bao lâu, hoặc phạm vi đổi và cần ước lượng lại.

**Không dùng khi.** Các hạng mục chưa có tiêu chí nghiệm thu. Skill sẽ đánh dấu `NEEDS INTAKE` thay
vì đoán, đó là câu trả lời đúng nhưng không phải câu bạn muốn nghe.

**Thói quen tạo ra khác biệt.** Mỗi con số đều mang theo căn cứ của nó, thường là một hạng mục tương
tự trong quá khứ tìm được từ lịch sử git. Con số không có căn cứ thì không tranh luận được và cũng
không học được gì từ nó.

---

## `atk:design-doc`

**Sinh ra.** Tài liệu thiết kế kỹ thuật: hiện trạng có trích dẫn `path:line`, tiêu chí ra quyết
định, từ hai phương án trở lên được so sánh, mô hình dữ liệu và API contract được chọn, migration và
cách rollback, rủi ro, danh sách người phải review, cùng ADR tương ứng.

**Dùng khi.** Trước khi implement bất cứ thứ gì đụng tới schema, một public contract, một module
dùng chung, hoặc nhiều hơn một service.

**Không dùng khi.** Thay đổi nhỏ, cục bộ và dễ quay lui. Viết design doc cho một sửa đổi hai file
tốn hơn phần nhận lại.

**Thói quen tạo ra khác biệt.** Một phương án thì là kế hoạch, không phải thiết kế. Tài liệu bắt
buộc có cả phương án mà team sẽ chọn theo quán tính, và nói rõ vì sao nó thua.

---

## `atk:breakdown`

**Sinh ra.** Các task, mỗi task một sản phẩm bàn giao, có người nhận, kèm đồ thị phụ thuộc với
đường găng được đánh dấu, các làn chạy song song có khai báo file mà mỗi làn sở hữu, và định nghĩa
hoàn thành cho từng task.

**Dùng khi.** Trước khi sprint bắt đầu, hoặc bất cứ khi nào công việc phải chia cho nhiều người.

**Không dùng khi.** Một người làm trọn trong một ngày.

**Thói quen tạo ra khác biệt.** Hai làn chạy song song không được sở hữu cùng một file, cùng một
chuỗi migration hay cùng một file config dùng chung. Khi buộc phải vậy, skill xếp chúng nối tiếp và
nói rõ ra, đó chính là thứ ngăn cú merge conflict mà không ai lường trước.

---

## `atk:convention`

**Sinh ra.** Quy ước của team được rút ra từ chính code và lịch sử git của team, mỗi quy tắc được
phân loại `ENFORCED` (công cụ chặn), `REVIEWED` (người kiểm trong review) hay `ASPIRATIONAL` (không
ai kiểm), kèm công cụ có thể tự động hóa những quy tắc đang phải kiểm bằng tay.

**Dùng khi.** Chưa có quy ước viết ra, quy ước đã viết không còn khớp với code, hoặc review cứ lặp
đi lặp lại cùng một comment.

**Không dùng khi.** Bạn muốn bê một style guide từ nơi khác về. Skill này ghi lại thứ team đang làm,
không phải thứ một tài liệu bên ngoài khuyến nghị.

**Thói quen tạo ra khác biệt.** Nhóm `ASPIRATIONAL`. Một quy tắc không ai kiểm được gọi đúng tên như
vậy, thay vì để nó trông như chính sách. Các quy tắc `REVIEWED` được viết theo định dạng bản ghi
trong `shared/review-checklist.md`, đó là thứ cho phép `atk:review` trích dẫn chúng theo ID.

---

## `atk:review`

**Sinh ra.** Các phát hiện được xếp hạng `BLOCKING`, `SHOULD FIX` và `NIT`, mỗi phát hiện trỏ tới
một dòng cụ thể, nói rõ nó gây hỏng gì và đề xuất một thay đổi cụ thể. Có thể đăng thẳng thành
comment inline trên PR.

**Dùng khi.** Trước khi approve một pull request, hoặc khi cần một ý kiến thứ hai.

**Không dùng khi.** Bạn muốn code được sửa chứ không phải được review, hoặc muốn chất vấn chính bản
yêu cầu (`atk:intake`).

**Thói quen tạo ra khác biệt.** Nó xuất phát từ việc thay đổi này lẽ ra phải làm gì, chứ không xuất
phát từ diff, và nó tách lỗi chặn merge khỏi ý kiến sở thích, đó là thứ khiến một lần review được
cảm nhận là công bằng. Một phát hiện về quy ước sẽ trích nguyên văn quy tắc kèm ID, để tác giả tranh
luận với quy tắc chứ không tranh luận với người review.

---

## `atk:qa`

**Sinh ra.** Test plan có tiêu chí vào và tiêu chí ra, test case truy vết tới tiêu chí nghiệm thu,
các case âm và biên, và ma trận regression trong đó mỗi dòng đều có lý do là chung module, chung
bảng hay chung endpoint.

**Dùng khi.** Một tính năng chuyển sang QA, một bản release cần chạy regression, hoặc team chưa có
test case viết ra.

**Không dùng khi.** Bạn muốn viết code test tự động. Skill này tạo bản kế hoạch để người chạy tay và
để dev tự động hóa từ đó.

**Thói quen tạo ra khác biệt.** Truy vết chạy cả hai chiều, nên tiêu chí chưa được test và test case
không gắn tiêu chí nào đều lộ ra.

---

## `atk:release`

**Sinh ra.** Danh sách thay đổi lấy từ khoảng commit, ghi chú nội bộ và ghi chú cho khách tách bạch,
danh sách migration kèm khả năng quay lui và yêu cầu downtime, checklist ba giai đoạn mỗi bước có
người phụ trách, kế hoạch rollback, và các chữ ký phê duyệt.

**Dùng khi.** Cắt một phiên bản, deploy lên staging hay production, hoặc viết ghi chú gửi khách.

**Không dùng khi.** Bạn muốn thực thi việc deploy. Pipeline và SRE làm việc đó.

**Thói quen tạo ra khác biệt.** Điều kiện kích hoạt rollback, các bước rollback và người có quyền ra
lệnh rollback đều được viết trước khi deploy, không phải ứng biến lúc đang cháy.

---

## `atk:incident`

**Sinh ra.** Trong lúc sự cố: một Incident Commander được chỉ định, một mức nghiêm trọng, và một
timeline có dấu thời gian. Sau sự cố: nguyên nhân gốc có bằng chứng kèm danh sách giả thuyết đã bị
loại, khoảng trống phát hiện, bản postmortem không quy trách nhiệm cá nhân, các hành động tiếp theo
có người và hạn, cùng runbook.

**Dùng khi.** Đang có sự cố, vừa xử lý xong, hoặc một kiểu hỏng cứ lặp lại.

**Không dùng khi.** Bạn cần tìm và sửa bug. Đó là việc debug; skill này dựng khung ứng phó bao quanh
việc đó.

**Thói quen tạo ra khác biệt.** Nguyên tắc không quy trách nhiệm được áp dụng theo cách kiểm tra
được: không câu nào được nêu tên một người như là nguyên nhân, và mọi hành động tiếp theo phải có
người và hạn, nếu không thì không được đưa vào tài liệu.

---

## `atk:retro`

**Sinh ra.** Kiểm chứng các hành động của retro lần trước kèm bằng chứng, dữ liệu sprint từ tracker,
git và CI, ý kiến của team để tách riêng khỏi dữ liệu đó, tối đa ba hành động mới có người và hạn, và
báo cáo tình hình cho đối tượng nội bộ hoặc khách hàng.

**Dùng khi.** Kết thúc một sprint, một milestone hay một phase, và khi tới hạn báo cáo.

**Không dùng khi.** Bạn muốn đánh giá một cá nhân. Skill sẽ không tạo ra thứ đó.

**Thói quen tạo ra khác biệt.** Nó mở đầu bằng câu hỏi các hành động của retro trước đã làm chưa. Một
team không bao giờ đóng được hành động của mình thì không cần thêm một danh sách hành động nữa.

---

## `atk:onboard`

**Sinh ra.** Các bước cài đặt rút ra từ chính repo và được đánh dấu `UNVERIFIED` ở chỗ không kiểm
chứng được, danh sách quyền truy cập ghi rõ ai cấp và có chặn ngày đầu không, bản đồ codebase theo
người sở hữu, các thỏa thuận làm việc của team, và kế hoạch tuần đầu kết thúc bằng một thay đổi thật
đã được merge.

**Dùng khi.** Có người mới vào, chuyển team, hoặc quay lại sau thời gian dài vắng.

**Không dùng khi.** Bạn cần đào tạo nghiệp vụ. Phần đó thuộc tài liệu domain của dự án.

**Thói quen tạo ra khác biệt.** Không một credential nào lọt vào tài liệu, chỉ ghi nơi lưu và người
cấp; và một bước cài đặt không kiểm chứng được thì nói thẳng ra thay vì làm như nó chạy tốt.

---

## `atk:handover`

**Sinh ra.** Danh sách công việc đang dở kèm trạng thái thật chứ không phải trạng thái trên ticket,
những quyết định mà lý do không nằm trong code, các cái bẫy, kế hoạch chuyển giao quyền truy cập và
nhiệm vụ định kỳ, danh bạ liên hệ, câu hỏi còn treo, và checklist kiểm chứng để người nhận ký.

**Dùng khi.** Một thành viên rời đi hoặc luân chuyển, một phase kết thúc, vendor bàn giao cho khách,
hoặc ai đó sắp vắng dài ngày.

**Không dùng khi.** Người nhận hoàn toàn mới với dự án; chạy `atk:onboard` trước, rồi mới tới skill
này.

**Thói quen tạo ra khác biệt.** Người nhận mới là người phê duyệt. Một cuộc bàn giao được chấp nhận
bởi người tiếp quản, không bao giờ do người rời đi tự tuyên bố là đã xong.

---

## Bắt đầu áp dụng

Bắt đầu từ chặng đang đau nhất. Ba điểm vào thường gặp:

- Yêu cầu tới mập mờ: `atk:intake`, rồi `atk:qa` khi đã có tiêu chí.
- Review thiếu nhất quán: `atk:convention`, rồi `atk:review` dựa trên nó.
- Kiến thức cứ đi theo người: `atk:handover` và `atk:onboard`.

Các artifact ghép được với nhau, vì mỗi skill sẽ đọc artifact của bước trước nếu có, nhưng không
skill nào bắt buộc phải có nó.
