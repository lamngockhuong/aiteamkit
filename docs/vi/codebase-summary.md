# Tổng hợp mã nguồn

Bản tra cứu từng file đang được quản lý trong repo. Tài liệu này lỗi thời ngay khi có file được
thêm, xóa hoặc đổi tên; hãy cập nhật trong cùng commit đó.

## Thư mục gốc

| File | Mục đích |
|------|----------|
| `README.md` | Điểm vào công khai: sơ đồ vòng đời, bảng 22 skill, khối invocation, quy ước output, hướng dẫn cài đặt |
| `CLAUDE.md` | Hướng dẫn cho người bảo trì: tiền đề về team, bố cục ba manifest, giải phẫu skill, nguyên tắc DRY của `shared/`, danh sách file phải đồng bộ chéo, chính sách em-dash, mục review checklist `CONV-NNN` mà repo này bị soi theo, quy trình release, lệnh kiểm tra |
| `CHANGELOG.md` | Do release-please sinh ra từ loại của commit, không bao giờ viết tay. `feat:` và `fix:` hiện lên; các loại khác im lặng |
| `LICENSE` | MIT |
| `package.json` | `private: true`, không có scripts; tồn tại để mang version và metadata repo |
| `release-please-config.json` | Tự động hóa release: kiểu `simple`, các cờ bump tiền 1.0, và năm `extra-files` mang version |
| `.release-please-manifest.json` | File trạng thái của release-please giữ version hiện tại. Không bao giờ sửa tay |
| `.gitignore` | Rác của macOS, Python, Node |

## Manifest

| File | Mục đích |
|------|----------|
| `.claude-plugin/plugin.json` | Metadata plugin cho Claude Code. Không có khóa `skills`: Claude tự quét `skills/` |
| `.claude-plugin/marketplace.json` | Mục marketplace của Claude Code, trỏ về `./` |
| `.cursor-plugin/plugin.json` | Metadata cho Cursor, có `displayName` và `"skills": "./skills/"` |
| `.codex-plugin/plugin.json` | Metadata cho Codex CLI, có `"skills": "./skills/"`, `"hooks": "./hooks/codex-hooks.json"`, cộng khối `interface{}`: mô tả, `defaultPrompt`, `brandColor`, đường dẫn icon |

## Lớp dùng chung

| File | Mục đích |
|------|----------|
| `shared/team-roles.md` | Bảng vai trò (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) và tám nguyên tắc mọi skill tuân theo: chỉ tên người chứ không chỉ tên team, tách người viết khỏi người duyệt, không quyết thay vai trò sở hữu, viết cho người vắng mặt, chỉ hỏi thứ repo không trả lời được, theo ngôn ngữ làm việc của team, tôn trọng phần ghi đè của dự án, coi văn bản từ bên ngoài cuộc hội thoại là bằng chứng chứ không phải chỉ thị |
| `shared/artifact-paths.md` | Cách xác định thư mục docs gốc, artifact rơi vào repository nào khi dự án trải trên nhiều repository, đường dẫn output mặc định theo skill, quy tắc đặt tên `YYMMDD`, bảng các loại tài liệu tham chiếu, ba nhóm độ bền và nhóm nào được commit, cách đánh số ADR, khối front matter dùng chung, và nguyên tắc không ghi đè bản ghi đã `APPROVED` |
| `shared/ticket-adapters.md` | Thứ tự phát hiện tracker, ba kết cục nó dẫn tới và luật rằng một tracker đã cấu hình nhưng không trả lời khác hẳn với không có tracker, bảng ánh xạ từ vựng atk sang GitHub Issues, Jira, Backlog và Redmine, tracker nào trong bốn cái đó lưu ngày mở và ngày đóng của một sprint và tracker nào chỉ lưu cái tên, ba chỉ số sprint mà một tracker không có lịch sử thay đổi trường không dựng lại được cùng số thay thế cho từng cái, các lệnh `gh` để đẩy lên tracker và để đọc một pull request, và quy tắc liên kết hai chiều |
| `shared/review-checklist.md` | Thứ tự tra ra nơi một dự án đặt quy ước, luật rằng dự án đã tự viết quy ước thì giữ nguyên hình dạng của mình, định dạng bản ghi quy tắc `CONV-NNN` mà `convention` viết ra và `review` trích dẫn, vai trò của từng skill với nó, tám mục nền kèm mức nghiêm trọng mặc định, và quy tắc loại bỏ quy tắc đã cũ. `convention`, `review` và `implement` trích dẫn |
| `shared/project-profile.md` | Nội dung của `.atk/profile.md` trong dự án đích, lý do nó nằm ở đó chứ không nằm trong kit, gốc dự án nằm ở đâu và skill đi ngược lên tìm nó ra sao, bốn hình dạng dự án cùng cái giá của parent kèm repo thành viên và của workspace không có parent, và quy tắc ba nhóm quyết định skill nào dừng, skill nào giảm chất lượng, skill nào bỏ qua khi thiếu profile |
| `shared/project-overrides.md` | Nội dung của `.atk/overrides/<skill>.md` trong dự án đích, vì sao mỗi skill một file thay vì nhiều file, hai mục `## Before` và `## After`, bảy thứ mà phần ghi đè không bao giờ được gỡ, dòng skill phải in ra khi bỏ qua một chỉ dẫn, và chỗ thư mục này nằm khi dự án trải trên nhiều repository. Vào qua nguyên tắc 7 của `shared/team-roles.md`, nên mọi skill đều tuân theo |
| `shared/finalize-steps.md` | Trình tự khép lại một phần việc đã xong: tài liệu tham chiếu mà nó mắc nợ, nhánh, commit, merge, ranh giới xin phép mà mọi hành động sau commit phải vượt qua, và thứ tự tiến hành một thay đổi trải trên nhiều repository. `atk:git` thi hành nó; file này là hợp đồng. Mọi skill làm xong việc đều trích dẫn |
| `shared/layer-verification.md` | Bảng năm tầng: chạy gì cho một tầng, một lượt đạt chứng minh được gì, và không chứng minh được gì. `fix`, `implement` và `verify` trích dẫn, để cả ba nói cùng một điều về cùng một kết quả |
| `shared/diagram-conventions.md` | Khi nào một sơ đồ xứng đáng có mặt trong artifact, bốn dạng hình kit vẽ (luồng duyệt, đồ thị phụ thuộc, sequence, chuỗi nhân quả), và các quy tắc giữ cho chúng dễ đọc: chỉ Mermaid, xuống dòng bằng `<br/>` chứ không bằng ký tự xuống dòng thô, gọi vai trò thay vì gọi tên người, hình thoi nào cũng có đủ hai nhánh, không đặt màu nền cứng. `catchup`, `design-doc`, `plan`, `breakdown` và `incident` trích dẫn |
| `shared/host-capabilities.md` | Skill được dùng những khả năng nào của agent chủ và gọi tên chúng ra sao, nguyên tắc vẫn cấm gọi tên lệnh của một kit khác, cách xử lý trên harness không có khả năng đó, bốn quy tắc của bước dọn mã, phần chính sách chặn số agent review chạy đồng thời trong một vòng, một lượt hỏi được tính thế nào trên harness gửi được nhiều câu hỏi cùng lúc, và khi nào được nêu tên một kết nối tới dịch vụ bên ngoài. `fix`, `implement`, `verify`, `review` và `init` trích dẫn, `design-sources.md` cũng vậy |
| `shared/spec-docs.md` | Điều tách một tài liệu tham chiếu khỏi một tài liệu thiết kế, nguyên tắc hình dạng tài liệu sẵn có của dự án thắng template của kit, sáu loại thay đổi buộc pull request phải mang theo tài liệu tham chiếu, trong đó có thành phần của một màn hình, nghĩa vụ ấy trở thành gì khi tài liệu nằm ở repository khác, và ranh giới giữa chỗ lệch với câu hỏi chưa ai trả lời. `spec`, `design-doc`, `implement`, `fix`, `verify` và `review` trích dẫn |
| `shared/host-file-locations.md` | Cách nhận ra code host theo thứ tự riêng, các vị trí mà GitHub và GitLab đọc `CONTRIBUTING.md`, template pull request và `CODEOWNERS`, cả hai cách viết hoa thường, và luật một file có mặt ở bất kỳ vị trí nào thì coi như đã có, kể cả vì sao một file rỗng ruột vẫn tính là chưa có. `convention` dùng để biết thiếu gì, `git` dùng để tìm template phải điền, `init` dùng để tìm `CODEOWNERS` đang giữ sẵn định danh host của cả đội |
| `shared/design-sources.md` | Cách một skill đọc design Figma: tìm kết nối theo việc nó làm được, ba trạng thái của kết nối (chưa cài, chưa đăng nhập, sẵn sàng) và đường lùi về ảnh export, ba lượt đọc, bỏ qua layer ẩn, một đường dẫn chứa nhiều màn hình, node ID làm khóa ổn định, cách xử lý giá trị design không cho thấy, và bốn trường `design_source`, `design_node`, `design_read`, `design_fingerprint` mà một lần đọc ghi lại. `spec` trích dẫn cho kind `screen`, `intake` trích dẫn khi yêu cầu là một design |
| `shared/tidy-pass.md` | Nội dung của bước dọn mã: ba lăng kính (tái dùng, sáng rõ, hiệu năng), phần được sửa, phần không bao giờ đụng, và những gì phải soi lại trong diff sau đó. `fix`, `implement` và `verify` trích dẫn thông qua `host-capabilities.md`, và đây là lý do kit không có skill `simplify` |

## Hook

| File | Mục đích |
|------|----------|
| `hooks/hooks.json` | Đăng ký hai hook cho Claude Code, cả hai ở dạng exec nên không nền nào dùng tới shell: `"command": "node"` cộng `${CLAUDE_PLUGIN_ROOT}` trong `args` |
| `hooks/codex-hooks.json` | Đăng ký đúng hai script đó cho Codex, nơi gốc plugin chỉ được thay bên trong `command` chứ không bao giờ trong `args`: mỗi hook một chuỗi `command` mang `${PLUGIN_ROOT}`. Codex tới được file này qua khóa `hooks` trong `.codex-plugin/plugin.json`, cũng chính là thứ khiến Codex thôi đọc file của Claude Code |
| `hooks/check-profile.mjs` | `SessionStart`. Node ESM, nên cư xử như nhau trên Linux, macOS và Windows. In một lời nhắc khi một repo git chưa có `.atk/profile.md` ở chính nó hoặc ở bất kỳ thư mục cha nào phía trên, và chỉ nhận profile ở trên khi profile đó có nhắc tới thư mục xuất phát, nên một repo thành viên của dự án có profile đặt ở parent thì im lặng còn một repo không liên quan nằm cùng thư mục cha thì vẫn được nhắc, mỗi dự án một lần, và thoát 0 ở mọi nhánh. Không chặn, không ghi gì vào repo của người dùng. Đã đăng ký trên Claude Code và trên Codex; Cursor chưa có lớp vỏ riêng |
| `hooks/load-overrides.mjs` | `PreToolUse` với matcher `Skill`. Đặt `.atk/overrides/<skill>.md` ra trước skill sở hữu file đó, chỉ để đỡ một lượt đọc chứ không làm gì thêm. Chỉ trả lời cho skill thuộc namespace `atk:`, nên một skill trùng tên của kit khác không bao giờ nhận chỉ dẫn của dự án này. In ra một object rỗng khi payload thuộc công cụ khác, khi namespace khác, khi tên không có tiền tố, khi không có file, khi tên skill chứa dấu phân cách đường dẫn, hoặc khi đầu vào hỏng; file dài quá 4096 ký tự thì gọi tên chứ không chép vào. Nơi không có hook, mỗi skill tự mở file |

## `.atk/` của chính repo này

Kit tự áp lên mình. Do `atk:init` và `atk:tailor` viết ra ngay trong repo này, được các skill đọc ở
đầu workflow, và được commit để người bảo trì sau thừa hưởng cả hai. Bản cài plugin sao nguyên repo
nên cả hai file đến tay mọi người cài `atk`. Mỗi file đều nói ngay dòng đầu rằng nó thuộc về repo
này, và không skill nào đọc chúng cho dự án khác.

| File | Mục đích |
|------|----------|
| `.atk/profile.md` | Profile của chính repo này: không có lệnh build cũng không có lệnh test, nên mục Commands mang bốn phép kiểm trong `CLAUDE.md` thay cho chúng, cộng một tầng nội dung, thư mục docs là `docs/`, `CLAUDE.md` vừa là nơi giữ quy ước vừa là nơi giữ review checklist, và tracker là GitHub Issues |
| `.atk/overrides/review.md` | Phần ghi đè mà `atk:tailor` viết cho `atk:review` ở đây: diff chạm vào một khối lệnh kiểm tra trong `CLAUDE.md` thì phải kiểm bằng cách chạy khối đó chứ không phải bằng cách đọc, ở mức `BLOCKING`. Các luật về nội dung repo không nằm trong file này; chúng là những dòng `CONV-NNN` trong `CLAUDE.md` |

## Các skill

Mỗi skill là một `SKILL.md` kèm một `evals/trigger_evals.json`. Mười bốn skill có thêm `references/`;
tám skill còn lại thì chưa.

| File | Chặng | Sinh ra |
|------|-------|---------|
| `skills/help/SKILL.md` | Bất kỳ lúc nào | Không có file: skill nên chạy tiếp theo suy ra từ trạng thái dự án, bằng chứng đứng sau nó, và việc gì đang chờ ai |
| `skills/init/SKILL.md` | Khởi tạo | `.atk/profile.md`: lệnh, tầng, thư mục docs, tracker, team, và cách kiểm chứng lúc chạy |
| `skills/tailor/SKILL.md` | Khởi tạo | `.atk/overrides/<skill>.md`: điều team này muốn một skill làm khác đi, người duyệt là vai sở hữu kết quả |
| `skills/intake/SKILL.md` | Yêu cầu | User story, tiêu chí nghiệm thu, ngoài phạm vi, câu hỏi treo có người phụ trách |
| `skills/catchup/SKILL.md` | Yêu cầu | Bản tóm tắt cho người không có mặt trong cuộc hội thoại, kèm phần tự kiểm hiểu bài cho epic |
| `skills/estimate/SKILL.md` | Lập kế hoạch | Ước lượng có căn cứ và độ tin cậy, capacity, cam kết sprint, phần dư |
| `skills/design-doc/SKILL.md` | Thiết kế | Tài liệu thiết kế có so sánh phương án, kèm ADR; với `--spike`, một cuộc điều tra có giới hạn thời gian, kết thúc bằng một khuyến nghị |
| `skills/spec/SKILL.md` | Thiết kế | Tài liệu tham chiếu cho API, schema, tính năng và màn hình, ghi đè tại chỗ, kèm chế độ dò lệch |
| `skills/breakdown/SKILL.md` | Lập kế hoạch | Task có người nhận, đồ thị phụ thuộc, làn song song kèm quyền sở hữu file |
| `skills/convention/SKILL.md` | Phát triển | Quy ước team phân loại enforced / reviewed / aspirational |
| `skills/plan/SKILL.md` | Phát triển | Phase kết thúc bằng thứ đem duyệt được, bước giữ cây mã chạy được, ranh giới phạm vi; với `--review` là danh sách phát hiện về bản kế hoạch do người khác viết |
| `skills/implement/SKILL.md` | Phát triển | Mã nguồn, kiểm chứng theo tầng, kèm bản ghi trở thành phần mô tả pull request |
| `skills/fix/SKILL.md` | Phát triển | Nguyên nhân đã chứng minh, thay đổi nhỏ nhất gỡ được nó, và báo cáo đã kiểm những gì |
| `skills/review/SKILL.md` | Phát triển | Phát hiện xếp hạng blocking / should fix / nit, có thể đăng lên PR |
| `skills/qa/SKILL.md` | Kiểm thử | Test plan, test case có truy vết, ma trận regression, tiêu chí vào và ra |
| `skills/verify/SKILL.md` | Kiểm thử | Hệ thống chạy thật, khẳng định tác động trong dữ liệu, báo lên người có tên sau ba vòng |
| `skills/git/SKILL.md` | Quản lý phiên bản | Đọc diff trước khi stage, quét dừng lại khi gặp thông tin đăng nhập, commit revert được một mình, và push, pull request, merge đều chờ lời đồng ý riêng |
| `skills/release/SKILL.md` | Bàn giao | Ghi chú theo đối tượng, checklist có người phụ trách, migration, rollback, phê duyệt |
| `skills/incident/SKILL.md` | Vận hành | Timeline, nguyên nhân gốc có bằng chứng, postmortem, hành động, runbook |
| `skills/retro/SKILL.md` | Cải tiến | Kiểm chứng hành động cũ, bằng chứng sprint, ba hành động mới, báo cáo |
| `skills/onboard/SKILL.md` | Con người | Cài đặt đã kiểm chứng, danh sách quyền, bản đồ code, tuần đầu kết thúc bằng phần đóng góp của vai trò |
| `skills/handover/SKILL.md` | Con người | Trạng thái thật của việc dở, quyết định, bẫy, chuyển giao quyền, người nhận ký |

### Thư mục `references/`

Chỉ được nạp khi một bước trong workflow mở ra, nên chúng nằm ngoài ngữ cảnh mặc định.

| File | Mục đích |
|------|----------|
| `skills/help/references/state-signals.md` | Những artifact nào chặn skill tiếp theo khi còn chờ duyệt, những bằng chứng trên đĩa gọi tên skill đó, theo thứ tự cần kiểm, và cách gom các artifact đang chờ một người |
| `skills/init/references/detection.md` | Cách xác định gốc dự án và hình dạng repository trước mọi thứ khác, tìm từng trường của profile ở đâu, và làm gì khi repo cho nhiều đáp án hoặc không cho đáp án nào |
| `skills/init/references/profile-template.md` | Bố cục của `.atk/profile.md` mà `init` điền vào, bảng Repositories của một dự án nhiều repository, và luật mọi đường dẫn đều viết từ gốc dự án |
| `skills/tailor/references/interview.md` | Năm nhóm câu hỏi, bộ lọc đẩy câu trả lời sang `init` hoặc `convention`, và một ví dụ cho mỗi nhóm |
| `skills/tailor/references/audit.md` | Ba phép kiểm của `--audit`, vì sao mâu thuẫn là khẳng định còn neo lỗi thời là nghi vấn, và luật nó không sửa gì |
| `skills/tailor/references/feedback.md` | Ba nhánh một lần chạy hỏng rẽ vào, bản ghi `--feedback` chứa gì, hai thứ nó không bao giờ được chứa, và chế độ này khác đi thế nào với skill không thuộc kit |
| `skills/intake/references/requirement-template.md` | Bố cục cố định của một requirement: bảy mục đánh số, câu story, ID `AC N.M` mà các skill khác trích dẫn và vì sao không bao giờ đánh số lại, các cột của bảng câu hỏi mở và bảng vùng ảnh hưởng, và những gì giữ nguyên khi dùng `--lang` |
| `skills/catchup/references/brief-template.md` | Một khung chung cho hai chế độ, phần khác nhau giữa epic và pull request được đánh dấu theo từng mục |
| `skills/catchup/references/understanding-check.md` | Bộ câu hỏi cố định, bảng phân loại kiểu tính năng, và hai quy tắc quyết định phần tự kiểm có giá trị hay không |
| `skills/design-doc/references/spike.md` | Chế độ `--spike`: một câu hỏi phân định các phương án, giới hạn thời gian và ai đặt ra nó, điều gì sẽ được tính là câu trả lời, viết ra trước khi tìm hiểu, ba loại bằng chứng, vì sao prototype đứng ngoài thay đổi, và bản ghi spike |
| `skills/convention/references/collaboration-files.md` | `CONTRIBUTING.md`, template pull request và `CODEOWNERS` mỗi file mang gì, mỗi host đặt chúng ở đâu, và vì sao người sở hữu không bao giờ suy ra từ lịch sử git |
| `skills/convention/references/stack-standards.md` | Cách nhận ra một ngôn ngữ hay công nghệ từ những gì có trên đĩa và theo thứ tự tin cậy nào, ngưỡng mà dưới đó nó không tính là stack, cách nhóm rule suy ra theo công nghệ và, khi một công nghệ trải qua nhiều layer của profile, theo layer, và hình dạng bộ `docs/standards/` |
| `skills/convention/references/standard-sources.md` | Bảy trường của `standard-sources.tsv` mang nghĩa gì, ngày `checked` chứng minh điều gì, một lần chạy được rút gì từ một dòng và không bao giờ được chép gì, team thêm nguồn riêng ở đâu, và cách clone thưa cùng chỗ đặt cache và luật khi lấy về hỏng |
| `skills/convention/references/standard-sources.tsv` | Chính mười sáu bộ chuẩn đã công bố, mỗi dòng một nguồn theo bảy trường mà `standard-sources.md` định nghĩa, dưới một dòng tiêu đề; số trường và ngày `checked` được kiểm trong `CLAUDE.md` |
| `skills/plan/references/step-ordering.md` | Hai lần cắt, theo phase và theo bước, mỗi lần một quy tắc riêng |
| `skills/plan/references/plan-template.md` | Trang chỉ mục của kế hoạch và một file phase |
| `skills/plan/references/plan-self-review.md` | Sáu điều một bản kế hoạch khẳng định, cách mở lại từng điều để đối chiếu với kho mã, và xử lý ra sao với mỗi kết quả |
| `skills/plan/references/plan-review-mode.md` | Soát bản kế hoạch do người khác viết: các dạng đầu vào, cách quy đổi từng kết quả, thang mức độ, và hình dạng báo cáo |
| `skills/plan/references/report-format.md` | Hình dạng báo cáo soát kế hoạch: mã định danh kết quả mang tiền tố mức nghiêm trọng và cách nó được giữ sang lượt soát sau trên cùng bản kế hoạch, các nhãn dưới mỗi kết quả và vì sao không nhãn nào nêu cách sửa, bảng xếp kết quả theo từng phase, thứ tự các mục, và vì sao không mục nào trong đó có kết luận hay điểm số |
| `skills/implement/references/plan-gate.md` | Ba mức quyết định một phần việc cần bao nhiêu đồng thuận trước khi viết dòng mã đầu tiên, và xử lý ra sao với câu hỏi mở cùng nhánh rẽ thiết kế mà bản kế hoạch trả về |
| `skills/implement/references/verification.md` | Thứ tự chạy các phép kiểm, phạm vi cần với tới, và lúc nào dừng |
| `skills/implement/references/review-fix-loop.md` | Vòng gọi review team lên chính output của skill, và trần chặn vòng lặp che đi một vấn đề thiết kế |
| `skills/fix/references/investigate.md` | Chứng minh nguyên nhân, kiểm xem hành vi hiện tại có phải chủ ý, và cổng quyết định có được sửa hay không |
| `skills/fix/references/layer-playbooks.md` | Theo từng tầng: nguyên nhân thường nấp ở đâu, tái hiện thế nào, và xác nhận nó đã hết ra sao |
| `skills/fix/references/report-template.md` | Báo cáo sửa lỗi, viết cho người review phải kiểm lại một khẳng định chứ không phải tin vào nó |
| `skills/spec/references/api-spec-template.md` | Hình dạng tài liệu API cho thư mục còn trống: bảng kiểu xử lý đặt trước, rồi mỗi endpoint một khối |
| `skills/spec/references/db-spec-template.md` | Hình dạng tài liệu bảng: cột, khóa, vòng đời một hàng, luật truy cập |
| `skills/spec/references/feature-spec-template.md` | Hình dạng tài liệu tính năng: lối vào gồm cả job, hành vi theo điều kiện, quyền theo vai trò |
| `skills/spec/references/screen-spec-template.md` | Hình dạng tài liệu màn hình: bảng thành phần lấy node ID của Figma làm khóa, các trạng thái, đề xuất được đánh dấu và có nguồn, và cách đưa một design đã đổi vào tài liệu theo từng dòng |
| `skills/spec/references/drift-check.md` | Bảng kiểm phủ, hình dạng một phát hiện, ba mức nghiêm trọng, và ranh giới chỉ đọc |
| `skills/review/references/review-rounds.md` | Chín vòng review và mỗi vòng mở ra cái gì trước, ngưỡng số dòng thay đổi quyết định các vòng có chạy trong agent riêng hay không, vòng nào chạy nhiều bản khi có `--parallel` và vòng nào không bao giờ, dòng nào được tính vào bậc và vì sao tệp do máy sinh thì không, phải làm gì khi một agent không trở về, cách agent gọi phát trước một vòng khi điều phối mà không cho vòng nào thấy kết quả của vòng khác, và cách gộp phát hiện thành một danh sách xếp hạng trong từng vòng rồi giữa các vòng |
| `skills/review/references/report-format.md` | Hình dạng báo cáo review: mã định danh phát hiện mang tiền tố mức nghiêm trọng và cách nó được giữ sang lượt review sau trên cùng đối tượng, các nhãn dưới mỗi phát hiện gồm cả rule quy ước mà nó viện dẫn, bảng các vòng, thứ tự các mục, ngôn ngữ viết chúng, và vì sao không mục nào trong đó có điểm số |
| `skills/qa/references/case-dimensions.md` | Mười chiều mà mỗi tiêu chí chấp nhận được đi qua để tìm ca âm và ca biên, quy tắc rằng một chiều bị bỏ qua phải kèm giả định của nó, và mức ưu tiên một ca nhận từ thứ bị hỏng |
| `skills/verify/references/runtime-checks.md` | Dựng ứng dụng lên, tác động vào nó, khẳng định một tác động thật, và dọn dẹp sau đó |
| `skills/verify/references/ui-checks.md` | Lượt chạy `--ui`: đối chiếu màn hình với bản thiết kế |
| `skills/verify/references/report-template.md` | Báo cáo kiểm chứng, nêu rõ đã chứng minh được gì và chưa chứng minh được gì |
| `skills/git/references/secret-scan.md` | Các mẫu quét trong phần đã stage, những đường dẫn tự nó đã là phát hiện, và vì sao một lần trúng chặn cả lượt chạy |
| `skills/git/references/commit-craft.md` | Chỗ một commit kết thúc và commit sau bắt đầu, cái bẫy format toàn file, và phần thân commit mang bằng chứng gì |
| `skills/git/references/repair.md` | Rebase, gỡ conflict và fixup, cùng ba lần kiểm tra phải làm trước khi viết lại lịch sử đã có trên remote |
| `skills/git/references/stacked.md` | Vòng đời chồng pull request, và chỗ phải dừng: mỗi tầng một lời đồng ý và một cửa kiểm tra riêng |
| `skills/git/references/pr-body.md` | Tìm template pull request của dự án ở đâu, artifact điền vào nó thế nào, và vì sao một ô tick là một lời khẳng định chứ không phải để trang trí |
| `skills/git/references/multi-repo.md` | Đọc trạng thái mọi repository của dự án, thứ tự tiến hành một thay đổi trải trên chúng, luật con trỏ submodule, một tên nhánh và một pull request liên kết chéo cho mỗi repository, và lời đồng ý hỏi riêng cho từng repository |
| `skills/onboard/references/roles.md` | `--role` đổi những gì, tức là cột chặn ngày đầu của danh sách quyền và thứ mà tuần đầu kết thúc bằng, cùng ba bước nó không đụng tới để hai lượt chạy còn so được với nhau |

### Thư mục `evals/`

Mỗi skill một file, là mảng `{query, should_trigger}` kiểm phần `description` của chính skill đó,
bằng cả ba ngôn ngữ trigger. Kit không kèm bộ chạy; xem phase 4 trong `docs/vi/project-roadmap.md`.

| File | Mục đích |
|------|----------|
| `skills/help/evals/trigger_evals.json` | Hỏi skill nào phù hợp, đối lại `onboard`, `init`, `catchup`, `tailor`, và những yêu cầu làm việc chỉ tình cờ có chữ help |
| `skills/init/evals/trigger_evals.json` | Cách nói về khởi tạo, đối lại những yêu cầu cấu hình dự án không thuộc `init` |
| `skills/tailor/evals/trigger_evals.json` | Việc chỉnh một skill cho hợp team, đối lại cặp `convention` và `init` mà nó không được giành |
| `skills/intake/evals/trigger_evals.json` | Một yêu cầu thô thành user story, đối lại `design-doc`, `estimate` và `breakdown` |
| `skills/catchup/evals/trigger_evals.json` | Nắm bắt việc đang chạy, đối lại `intake` và `onboard` |
| `skills/estimate/evals/trigger_evals.json` | Ước lượng và capacity, đối lại `breakdown` và `retro` |
| `skills/design-doc/evals/trigger_evals.json` | Chọn phương án, đối lại `intake`, `spec` và `plan` |
| `skills/spec/evals/trigger_evals.json` | Tài liệu tham chiếu, đối lại `design-doc`, `intake` và việc sinh mã |
| `skills/breakdown/evals/trigger_evals.json` | Chia việc giữa nhiều người, đối lại `plan` và `estimate` |
| `skills/convention/evals/trigger_evals.json` | Ghi lại luật của team và standard theo từng công nghệ, đối lại `review`, `init`, `tailor` và `design-doc` |
| `skills/plan/evals/trigger_evals.json` | Lập kế hoạch cho một người, đối lại `breakdown` và `design-doc` |
| `skills/implement/evals/trigger_evals.json` | Làm việc xây dựng, đối lại lập kế hoạch và review |
| `skills/fix/evals/trigger_evals.json` | Một lỗi, đối lại `incident` và việc triển khai thông thường |
| `skills/review/evals/trigger_evals.json` | Đọc một diff, đối lại `qa`, `verify`, `fix` và `catchup` |
| `skills/qa/evals/trigger_evals.json` | Test case và test plan viết ra, đối lại `verify` và việc viết mã test tự động |
| `skills/verify/evals/trigger_evals.json` | Kiểm chứng lúc chạy, đối lại `qa` và `review` |
| `skills/git/evals/trigger_evals.json` | Commit, pull request và rebase, đối lại `review`, `release` và `implement` |
| `skills/release/evals/trigger_evals.json` | Ghi chú và checklist deploy, đối lại `incident` và `qa` |
| `skills/incident/evals/trigger_evals.json` | Một sự cố và postmortem của nó, đối lại `fix` và `release` |
| `skills/retro/evals/trigger_evals.json` | Bằng chứng sprint và báo cáo tình hình, đối lại `estimate` và `handover` |
| `skills/onboard/evals/trigger_evals.json` | Một người vào dự án, đối lại `handover`, `init` và `catchup` |
| `skills/handover/evals/trigger_evals.json` | Một người rời việc, đối lại `onboard` và `catchup` |

## Assets

| File | Mục đích |
|------|----------|
| `assets/atk-icon.svg` | Icon vuông, hai hình người trên nền xanh bo góc. `.codex-plugin` dùng làm `composerIcon` |
| `assets/atk-logo.svg` | Logo ngang, icon cộng chữ. `.codex-plugin` dùng làm `logo` |

## Tài liệu

Bản tiếng Anh là nguồn sự thật; `docs/vi/` mirror theo từng file.

| File | Mục đích |
|------|----------|
| `docs/project-overview-pdr.md` | atk là gì, những kiểu hỏng quy trình nó nhắm tới, mục tiêu, phi mục tiêu, đối tượng, tiêu chí thành công |
| `docs/system-architecture.md` | Một cây nội dung ba manifest, mô hình nạp và ngân sách kích thước, lớp `shared/`, giải phẫu skill, luồng dữ liệu lúc chạy |
| `docs/skills-overview.md` | Theo từng skill: sinh ra gì, khi nào dùng, khi nào không, và thói quen làm nên khác biệt |
| `docs/artifact-lifecycle.md` | Artifact nào nên commit, cái nào được phép xóa, xóa mỗi loại thì mất gì, và ba chính sách một đội có thể chọn |
| `docs/codebase-summary.md` | Chính là file này |
| `docs/project-roadmap.md` | Kế hoạch theo phase và trạng thái |
| `docs/trigger-eval-measurement.md` | Cách lấy một số đo đúng từ `evals/trigger_evals.json`: vì sao một bộ chạy thông thường báo ra điểm số rỗng, hook `PreToolUse` đo được việc chọn skill, ba điều kiện một lượt chạy cần có, và những case không gì quan sát được |
| `docs/flow/project-flow.md` | 22 skill đặt vào các pha bàn giao, kèm người viết và người duyệt từng artifact, và vòng quay lại khi artifact bị trả về |
| `docs/flow/skill-chain.md` | Chuỗi artifact: mỗi skill đọc gì, để lại gì, skill nào nhặt tiếp, và ba chỗ chuỗi hay đứt |
| `docs/flow/skill-lifecycle.md` | Bên trong một skill: chín mục mà `SKILL.md` nào cũng có, năm chặng của một lượt chạy, và năm loại quan hệ giữa các skill, trong đó chỉ bốn loại xảy ra lúc chạy |
| `docs/vi/**/*.md` | Bản tiếng Việt mirror mười file trên, đặt ở cùng đường dẫn tương đối |

## GitHub

| File | Mục đích |
|------|----------|
| `.github/workflows/release-please.yml` | Chạy release-please khi push lên `main` |
| `.github/workflows/labeler.yml` | Gắn label cho từng pull request theo đường dẫn file nó thay đổi, dựa trên `.github/labeler.yml` |
| `.github/labeler.yml` | Quy tắc đường dẫn cho labeler: mỗi phần của kit một label `area:`, mỗi skill một label `skill:`, phải có đủ 22 skill |
| `.github/PULL_REQUEST_TEMPLATE.md` | Hướng dẫn Conventional Commit, harness bị ảnh hưởng, và checklist kiểm tra gồm cả các mục đồng bộ chéo |
| Các form `.github/ISSUE_TEMPLATE/*.yml` | Mỗi form gắn label loại của nó cùng `status: triage` |
| `.github/ISSUE_TEMPLATE/config.yml` | Tắt issue trống, dẫn sang Discussions |
| `.github/ISSUE_TEMPLATE/bug-report.yml` | Form bug với dropdown harness và component. Danh sách component phải có đủ 22 skill, cộng profile, phần ghi đè, lớp dùng chung và các hook |
| `.github/ISSUE_TEMPLATE/feature-request.yml` | Form tính năng, hỏi tình huống của team trước khi hỏi năng lực đề xuất |
| `.github/ISSUE_TEMPLATE/skill-run-report.yml` | Form báo lần chạy skill, nhận bản ghi `--feedback`: đã yêu cầu gì, bước nào chạy, chỗ nào skill không nói, và team mong đợi gì |
