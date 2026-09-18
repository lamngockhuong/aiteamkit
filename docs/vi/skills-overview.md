# Tổng quan các skill

Mười tám skill phủ vòng đời delivery của một team. Mỗi mục nói rõ skill sinh ra gì, khi nào nên
dùng, và khi nào không nên.

Nên đọc phần này trước khi áp dụng bộ kit: mỗi skill chạy độc lập được, và team có thể bắt đầu chỉ
với một skill.

## Vị trí trong vòng đời

```
init -> intake -> catchup -> estimate -> design-doc -> breakdown -> convention
                                                                        |
                                                                        v
           release <- verify <- qa <- review <- implement <- plan <------+
              |
              v
           incident -> retro

  fix        khi có lỗi được báo, ở bất kỳ điểm nào
  onboard    khi có người vào
  handover   khi có người rời đi, hoặc một phase kết thúc
```

`atk:init` chạy một lần cho mỗi dự án. Nó viết ra `.atk/profile.md`, file cho các skill có động tới
mã nguồn biết dự án này test thế nào, build ra sao và chia tầng thế nào. `atk:implement`, `atk:fix`
và `atk:verify` dừng nếu thiếu nó. `atk:plan` vẫn chạy tiếp nhưng nói rõ trong artifact phần nào là
suy đoán. Những skill còn lại chạy mà không cần tới nó.

---

## `atk:init`

**Sinh ra.** File `.atk/profile.md` trong dự án. Nó ghi lệnh test, build và lint của từng app, bố
cục các tầng kèm tài liệu chuẩn và module mẫu cho mỗi tầng, các thư mục docs, tracker và nơi đặt tài
liệu đặc tả, cùng ai duyệt cái gì. Mục cuối nói cách khởi động ứng dụng và cách xác nhận một tác động
đã thật sự xảy ra trong dữ liệu.

**Dùng khi.** Một team cài `atk` vào dự án lần đầu, và dùng lại khi dự án đã đi xa hơn những gì
profile đang ghi. Cờ `--audit` đối chiếu profile hiện có với repo và không sửa gì.

**Không dùng khi.** Bạn muốn cấu hình kit một lần cho mọi dự án. Một profile chỉ đúng với một dự án
và được commit cùng dự án đó; bản thân kit không giữ sự thật nào của dự án.

**Thói quen tạo ra khác biệt.** Nó đọc repo trước khi hỏi. Câu nào mà file manifest, workflow CI hay
thư mục test đã trả lời được thì nó không đem ra hỏi người. Phần không file nào trả lời được sẽ thành
`TBD` kèm tên người nợ câu trả lời, chứ không thành một phỏng đoán.

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

## `atk:catchup`

**Sinh ra.** Với một epic: công việc là gì và làm cho ai, vì sao làm lúc này, cái gì trong và ngoài
phạm vi, ai quyết cái gì, những thuật ngữ người mới sẽ không hiểu, những chỗ dễ làm sai, và phần tự
kiểm hiểu bài mà dev phải trả lời trước khi viết dòng mã nào. Với một pull request: cùng bản
tóm tắt đó nhưng gói trong phạm vi diff, không có phần tự kiểm.

**Dùng khi.** Một người nhận epic mà họ không tham gia soạn, vào một việc đang chạy giữa chừng, hoặc
phải review một pull request ở mảng họ không nắm.

**Không dùng khi.** Người đó mới với cả dự án chứ không riêng phần việc đang làm (`atk:onboard`),
hoặc bản thân yêu cầu còn mập mờ chứ không chỉ là lạ lẫm (`atk:intake`).

**Thói quen tạo ra khác biệt.** Phần tự kiểm do dev trả lời, không phải do skill điền sẵn. Một bản
tóm tắt không bắt ai phản hồi là bản tóm tắt không ai đọc.

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

## `atk:plan`

**Sinh ra.** Mã nguồn hiện đang làm gì, kèm đường dẫn file; các phase mà mỗi phase kết thúc bằng thứ
người review nhìn được; các bước bên trong một phase mà mỗi bước để lại cây mã vẫn chạy được; mỗi
bước động vào đâu và được kiểm bằng gì; phần cố ý để ngoài phạm vi; và phần còn chưa rõ kèm tên người
phải trả lời.

**Dùng khi.** Trước khi bắt đầu một phần việc đủ lớn để cần chia chặng, hoặc khi tiếp quản thứ do
người khác thiết kế mà các bước không hiển nhiên.

**Không dùng khi.** Việc phải chia cho nhiều người, đó là `atk:breakdown`; hoặc việc chỉ là một thay
đổi trong một file, khi bản kế hoạch tốn hơn chính phần việc.

**Thói quen tạo ra khác biệt.** Một phase không kết thúc được bằng thứ đem duyệt được thì không phải
phase, mà là một quãng nghỉ. Các bước được xếp sao cho cây mã vẫn chạy ở mọi ranh giới, và chính điều
đó khiến việc dừng giữa chừng trở nên an toàn.

---

## `atk:implement`

**Sinh ra.** Mã nguồn, cộng một bản ghi triển khai sẽ trở thành phần mô tả pull request: đã đổi gì và
vì sao, phủ những bước nào trong kế hoạch, lệnh đã chạy cho từng tầng kèm output của nó, bước dọn mã
đã đổi những gì, và phần cố ý chưa làm.

**Dùng khi.** Một ticket, một bản kế hoạch, hoặc một yêu cầu đã mô tả rõ đã sẵn sàng để làm, và câu
hỏi còn lại là làm thế nào chứ không phải làm cái gì.

**Không dùng khi.** Yêu cầu còn mập mờ (`atk:intake`), hoặc phần việc là truy nguyên nhân một lỗi
(`atk:fix`).

**Thói quen tạo ra khác biệt.** Cổng kế hoạch có ba mức chứ không phải hai nhánh. Thay đổi nhỏ đi
thẳng vào code. Thay đổi vừa thì gọi `atk:plan`, xác nhận bằng một câu, rồi đi tiếp. Chỉ thay đổi
chạm vào schema, hợp đồng công khai, nhiều service, hoặc còn một quyết định kiến trúc bỏ ngỏ mới dừng
chờ người duyệt. Soạn một danh sách bước thì không cần người duyệt; quyết kiến trúc thì cần.

Khi lượt kiểm chứng đã xanh, thay đổi được đưa qua khả năng dọn mã có sẵn của harness, `/simplify`
trên Claude Code, trước khi gọi review: người review nên dành lượt đọc cho hành vi, chứ không phải
cho đoạn trùng lặp mà tác giả tự bỏ được. Trên harness không có khả năng đó, bản ghi nói rõ bước này
đã không chạy, thay vì để nó biến mất không dấu vết.

---

## `atk:fix`

**Sinh ra.** Lỗi được ghi lại nguyên văn, nguyên nhân được chứng minh chứ không phải đoán, và một
lượt kiểm xem hành vi hiện tại có phải là quyết định ai đó đưa ra có chủ ý. Sau đó là thay đổi nhỏ
nhất gỡ được nguyên nhân, kiểm chứng theo tầng, và báo cáo nói rõ đã kiểm những gì và chưa kiểm những
gì.

**Dùng khi.** Có một bug report, một test đang đỏ, một endpoint hay một màn hình hỏng, hoặc một cuộc
điều tra phải kết thúc bằng lời giải thích chứ không phải phỏng đoán.

**Không dùng khi.** Production đang chết ngay lúc này: `atk:incident` điều phối cuộc ứng cứu, còn
skill này nằm bên trong đó. Hoặc chẳng có gì hỏng và mã chỉ đang khó chịu, vốn không phải một lỗi.

**Thói quen tạo ra khác biệt.** Không file nào đổi trước khi nguyên nhân được chứng minh, và chính
việc chứng minh cũng có trần: ba giả thuyết bị loại thì skill dừng lại và giao cuộc điều tra cho một
người có tên, vì thứ còn lại sau ba lần loại thường nằm trong đầu ai đó chứ không nằm ở một lượt tìm
kiếm nữa. Cờ
`--investigate-only` tồn tại vì lời giải thích thường đã là toàn bộ sản phẩm cần giao, và dừng ở đó
là một kết quả hợp lệ chứ không phải một việc dang dở. Bước dọn mã sau lượt kiểm chứng ở đây hẹp hơn
mọi chỗ khác trong kit: nó chỉ chạm đúng những dòng bản vá đã chạm, vì một bản vá mang kèm một lượt
dọn dẹp cả file xung quanh thì không revert gọn được vào ngày cần revert.

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

Thay đổi lớn hơn năm file sẽ được đọc nhiều lượt độc lập trên cùng một diff, khi harness chạy được
nhiều agent song song, và mỗi phát hiện mang theo con số bao nhiêu lượt đã nêu nó. Số lượt bị chặn
trên bởi bộ nhớ của máy, và ép được bằng `--parallel <N>`; phát hiện chỉ một lượt nêu ra phải được
đối chiếu lại với mã trước khi vào báo cáo. Nhiều lượt cùng nói một điều vẫn là công việc của một mô
hình, không thay được người đồng nghiệp đọc thay đổi rồi phê duyệt.

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

## `atk:verify`

**Sinh ra.** Ứng dụng được khởi động đúng cách dự án này khởi động nó, rồi được tác động bằng
request thật. Tác động sinh ra được khẳng định trong dữ liệu chứ không phải trong mã trạng thái, màn
hình được đối chiếu với bản thiết kế khi truyền `--ui`, và báo cáo nói rõ đã chứng minh được gì, chưa
chứng minh được gì.

**Dùng khi.** Bộ test đã xanh mà chưa ai nhìn thấy tính năng chạy, trước khi chuyển ticket cho QA,
hoặc trước khi một bản release đi ra.

**Không dùng khi.** Profile chưa có mục `Verify` nói cách khởi động ứng dụng và cách xác nhận một tác
động. Skill dừng thay vì đoán lệnh khởi động, vì một lệnh đoán mà thoát 0 sẽ được đọc như bằng chứng.

**Thói quen tạo ra khác biệt.** Một mã 200 không phải là kết quả. Skill khẳng định đúng cái dòng dữ
liệu, cái file, hoặc cái tin nhắn mà request lẽ ra phải sinh ra. Nó cũng dừng sau ba vòng và báo lên
một người có tên, thay vì cứ vá cho tới khi có thứ gì đó xanh. Mã mà các vòng thử đã đổi sẽ được dọn
lại, rồi chạy lại đúng ca đang hỏng, trước khi thay đổi được đóng: một bản vá làm ở cuối một lượt
chạy dài vẫn là thay đổi có người phải review.

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

Bắt đầu từ chặng đang đau nhất. Năm điểm vào thường gặp:

- Yêu cầu tới mập mờ: `atk:intake`, rồi `atk:qa` khi đã có tiêu chí.
- Review thiếu nhất quán: `atk:convention`, rồi `atk:review` dựa trên nó.
- Kiến thức cứ đi theo người: `atk:handover` và `atk:onboard`.
- Lỗi cứ quay lại vì nguyên nhân chưa bao giờ được tìm ra: `atk:fix`.
- Tính năng tới tay QA mà mới chỉ được nhìn thấy xanh trên CI: `atk:init`, rồi `atk:verify`.

`atk:implement`, `atk:fix` và `atk:verify` đòi có `.atk/profile.md` trước khi làm bất cứ việc gì, còn
`atk:plan` có nó thì cho ra kế hoạch tốt hơn. Mọi skill còn lại chạy được trên một bản clone mới
tinh, chưa cài đặt gì.

Các artifact ghép được với nhau, vì mỗi skill sẽ đọc artifact của bước trước nếu có, nhưng không
skill nào bắt buộc phải có nó.
