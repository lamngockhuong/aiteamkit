# Tổng quan dự án (PDR)

## atk là gì

`atk` (AI Team Kit) là một plugin gồm 12 skill phủ vòng đời phát triển phần mềm của **một team dự
án trong công ty**. Cùng một cây nội dung được phân phối cho Claude Code, Cursor và OpenAI Codex CLI.

Mỗi skill sinh ra một artifact Markdown mà team có thể review, phê duyệt và đưa cho một người không
có mặt trong cuộc hội thoại tạo ra nó: tài liệu yêu cầu, bảng ước lượng, tài liệu thiết kế kỹ thuật,
bảng chia task, tài liệu quy ước, kết quả review, test plan, release, postmortem sự cố, biên bản
retro, tài liệu onboarding hoặc tài liệu bàn giao.

## Vấn đề mà atk giải quyết

Phần lớn công cụ AI hỗ trợ lập trình được thiết kế cho một người làm việc một mình. Một team dự án
trong công ty gặp những kiểu hỏng khác, và chúng là hỏng về quy trình chứ không phải về code:

- Yêu cầu tới dưới dạng ba câu chat rồi đến tay dev mà không có tiêu chí nghiệm thu.
- Con số ước lượng không có căn cứ, nên không ai tranh luận được và cũng không rút ra được gì.
- Một quyết định thiết kế nằm trong một luồng chat, sáu tháng sau không ai tìm lại được.
- Một lần review trộn lẫn lỗi mất dữ liệu với góp ý đặt tên trong cùng một danh sách comment.
- Một bản release đi ra production mà không ai viết trước cách quay lui.
- Một sự cố được phân tích thành câu chuyện về một con người, thay vì một lỗ hổng của hệ thống.
- Một người nghỉ và mang theo kiến thức duy nhất về một bước deploy dễ vỡ.

`atk` ghi các bước này lại dưới dạng lặp lại được, kèm bằng chứng và tên người chịu trách nhiệm.

## Mục tiêu

1. **Mặc định theo hình dạng của team.** Người viết và người duyệt là hai người khác nhau. Artifact
   mang trạng thái phê duyệt. Câu hỏi còn treo ghi tên người phải trả lời.
2. **Bằng chứng trước khi khẳng định.** Skill đọc repo, lịch sử git, CI và tracker trước khi hỏi, và
   trích dẫn những gì tìm thấy.
3. **Quyết định thuộc về người sở hữu nó.** Skill soạn thảo và so sánh; phạm vi, độ ưu tiên, deadline,
   báo giá, tuân thủ và quyết định go hay no-go thuộc về một vai trò cụ thể.
4. **Không phụ thuộc công cụ.** Markdown là nguồn sự thật. Tracker chỉ giữ một con trỏ trỏ tới nó.
5. **Viết cho người vắng mặt.** Mọi artifact giả định người đọc đã bỏ lỡ cuộc họp.
6. **Trigger đa ngôn ngữ.** Cụm từ tiếng Anh, tiếng Việt và tiếng Nhật đều gọi được cùng một skill.

## Không nằm trong phạm vi

- **Viết code ứng dụng.** `atk` lo phần quy trình bao quanh code. Việc implement, debug và làm
  pipeline vẫn thuộc về bộ kit tổng quát mà team đang dùng.
- **Thay thế tracker hay công cụ quản lý test.** `atk` tạo nội dung; công cụ lưu nội dung đó.
- **Quyết định thay team.** Không skill nào tự duyệt output của chính nó, tự cam kết thay team, hay
  tự tuyên bố một bản release đã sẵn sàng.
- **Đánh giá nhân sự.** Không skill nào sinh ra nhận định về một cá nhân, và skill retro cấm điều đó
  một cách tường minh.
- **Ép một phương pháp luận.** Từ vựng nghiêng về Scrum (sprint, story, point) nhưng mọi skill đều
  chấp nhận person-day, milestone và phase thay thế.

## Đối tượng sử dụng

Các team dự án ở công ty phần mềm, thường từ năm đến mười lăm người, hay làm việc với khách hàng bên
ngoài, thường xuyên dùng lẫn tiếng Việt, tiếng Nhật và tiếng Anh. Danh sách vai trò nằm trong
`shared/team-roles.md`.

## Tiêu chí thành công

- Một người mới vào có thể thực thi output của bất kỳ skill nào mà không cần hỏi lại tác giả.
- Mọi artifact đều trả lời được ai chịu trách nhiệm cho các câu hỏi còn treo.
- Một team có thể áp dụng từng skill một, không cần áp dụng cả mười một skill còn lại.
