---
title: "ADR 0003: atk:orchestrate đề xuất các job mỗi phần việc còn cần, chạy chúng theo cách máy có sẵn, và không bao giờ tự trả lời một cổng duyệt"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-11
updated: 2026-10-15
ticket: none
---

# ADR 0003: atk:orchestrate đề xuất các job mỗi phần việc còn cần, chạy chúng theo cách máy có sẵn, và không bao giờ tự trả lời một cổng duyệt

Design: `docs/records/design/261011-1538-orchestrate-team-work.md`

## Bối cảnh

Hiện nay người dùng tự đưa từng phần việc đi qua kit bằng tay, mỗi lần một skill và một phần việc:
yêu cầu thô qua `atk:intake`, requirement qua `atk:design-doc` hoặc `atk:plan`, plan qua
`atk:implement`, lỗi qua `atk:fix`. Người bảo trì muốn có một điều phối viên:

- nhận việc ở bất kỳ giai đoạn nào;
- đọc xem mỗi phần việc đã đi đến đâu;
- đề xuất các job, skill và agent mỗi phần việc còn cần, để một người duyệt;
- chạy song song nhiều phần việc, mỗi phần trong một git worktree riêng.

Điều phối viên nên mở được agent qua một trình quản lý terminal báo cho biết mỗi agent đang rảnh, đang
làm hay đang chờ một câu hỏi. Người bảo trì cũng đặt câu hỏi: một skill phụ thuộc vào công cụ bên ngoài
thì có nên nằm trong `atk` hay không.

`atk:help` đã biết, cho phần việc của nhánh hiện tại, artifact nào phải chờ duyệt và skill nào chạy
tiếp. Các quy tắc đó đang nằm trong một file tham chiếu riêng của nó.

Hai lần thử ngày 2026-10-11 đã dùng một trình quản lý terminal cùng một CLI agent thứ hai, với Claude
Code làm điều phối viên. Các worktree chạy song song được, job đang chờ duyệt được phát hiện, và job
chạy tiếp sau khi người trả lời. Hai lần thử cũng cho thấy bốn giới hạn:

- sandbox chỉ cho ghi trong worktree thì không commit được trong chính worktree đó;
- màn hình không phải chỗ đáng tin để đọc kết quả;
- cờ dòng lệnh của CLI agent thay đổi theo phiên bản;
- bộ phân loại an toàn của phiên từ chối agent có quyền ghi mà không cần xin duyệt.

## Quyết định

`atk` có thêm skill thứ hai mươi lăm, `atk:orchestrate`, đứng ngay sau `atk:help` trong thứ tự vòng
đời.

- **Đọc trước rồi mới đề xuất.** Với mỗi phần việc, skill đọc xem phần việc đã đi đến đâu, theo đúng
  các quy tắc `atk:help` đang dùng. Các quy tắc đó chuyển sang `plugins/atk/shared/state-signals.md`
  để cả hai skill cùng trích một bản.
- **Đề xuất một chuỗi job cho mỗi phần việc.** Mỗi job là một skill atk, kèm agent chọn riêng cho job
  đó, cách chạy, và người trả lời các câu hỏi của nó.
- **Duyệt theo từng chặng.** Một lần duyệt bao trùm mỗi chuỗi đến hết artifact phải chờ duyệt đầu
  tiên. Phần còn lại của chuỗi được đề xuất lại khi artifact đó đã được duyệt.
- **Job không bao giờ trả lời thay người.** Job chạy một skill atk, không dùng skill của kit khác, và
  ghi kết quả ra file. Mọi câu hỏi của skill được chuyển cho người có tên. Mọi artifact phải chờ duyệt
  đều chờ người duyệt của nó. Điều phối viên không bao giờ tự trả lời hay tự duyệt.
- **Code dừng ở một commit cục bộ, kèm một lần `atk:review` độc lập.** Push, mở pull request và merge
  nằm ngoài skill.
- **Job chạy theo cách đầu tiên mà máy có, theo thứ tự cố định:**
  1. agent trong các pane terminal, qua một trình quản lý terminal chỉ được gọi theo việc nó làm được,
     và ghi rõ mới thử với Claude Code;
  2. subagent có sẵn của harness;
  3. từng job một ngay trong phiên, và bản ghi nói rõ như vậy.

  Không bước nào dừng chỉ vì thiếu trình quản lý terminal.

`plugins/atk/shared/host-capabilities.md` có thêm một mục cho agent có ghi. Trước nay chưa agent nào mà
kit mở ra sửa cây mã, trừ agent review band 1 ghi những gì một lượt review ghi.

## Hệ quả

- **Nhóm nào cũng dùng được skill.** Nhóm không có trình quản lý terminal chạy skill qua subagent
  hoặc chạy tuần tự.
- **`atk:help` và `atk:orchestrate` không thể lệch nhau** về bước tiếp theo, vì cùng đọc một file.
- **Mọi danh sách skill đều thay đổi.** Cả mười hai nhóm file của `CONV-001` đều thay đổi, và mọi
  danh sách skill thêm `orchestrate` ngay sau `help`.
- **Có skill thứ hai khởi chạy tiến trình kéo dài**, sau `atk:verify`, nên nó có mục
  `## Process management`.
- **Mọi commit đều do điều phối viên làm.** Job không bao giờ `git add` hay commit, vì cả hai đều ghi
  vào thư mục git của repository chính, nằm ngoài worktree; job để thay đổi trong cây làm việc, và
  điều phối viên commit qua `atk:git --commit`. Sandbox không bao giờ được nới rộng.
- **Tạm thời chỉ hỗ trợ một repository.** Dự án có profile nêu các repository thành viên, hoặc một
  workspace, bị từ chối ngay ở bước đề xuất: một worktree cho mỗi phần việc không chứa được cả tài
  liệu ở repo cha lẫn mã ở repo thành viên.
- **`atk:verify` không chạy trên các worktree song song**, vì các lần chạy sẽ tranh nhau một cổng.
  Verify được đề xuất cho từng nhánh, lần lượt từng cái.
- **Tên skill trùng với một skill của kit khác** đang cài trên máy người bảo trì. `description` và
  trigger evals phải tách được hai skill, và không file nào trong plugin được nêu tên kit kia.

## Các phương án bị loại

- **Chỉ ghi lại cách làm, không có skill.** Người dùng vẫn phải tự làm điều phối viên.
- **Một chuỗi cố định các tiến trình chạy một lần không người trông.** Tiến trình chạy một lần không có ai để hỏi khi gặp cổng duyệt, và chế độ ghi không cần duyệt
  của nó bị từ chối thẳng.
- **Đặt vào `atkx`.** Skill đọc requirement, design và plan, rồi tạo ra artifact và mã nguồn mà đồng
  đội phải review, nên trượt AC1 của `docs/records/design/260930-0933-atkx-utility-kit-placement.md`.
- **Một plugin thứ ba.** Tốn manifest, mục trong marketplace và một release package, mà không được
  thêm gì so với một skill trong `atk`.
- **Các tên `coordinate`, `dispatch` và `conduct`.** Tên `orchestrate` được chọn ngày 2026-10-11, chấp
  nhận rủi ro trùng tên.
