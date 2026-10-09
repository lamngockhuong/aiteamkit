# Đo eval trigger

Skill nào cũng mang theo `evals/trigger_evals.json`, một mảng `{query, should_trigger}` khẳng định
cách nói nào phải gọi được skill đó và cách nói nào thì không. Viết ra các file ấy thì dễ. Đo chúng
mới khó, và cách đo hiển nhiên nhất trả về một con số trông như kết quả nhưng không phải kết quả.

Tài liệu này dành cho người bảo trì muốn kiểm một thay đổi ở `description` bằng chính bộ case đó,
và cũng là cách đo mà bộ chạy trong `atkx:skill-eval` hiện thực.
Các file ấy chứa gì và sinh ra để làm gì thì đọc phase 4 trong [project-roadmap.md](project-roadmap.md);
ở đây chỉ nói cách lấy được một số đo đúng từ chúng.

## Con số đánh lừa

Một bộ chạy eval trigger thông thường, kể cả bộ đi kèm plugin skill-creator của Anthropic, đếm
trigger bằng cách sinh ra một bản sao tạm của skill rồi rình một lượt gọi tool `Skill` mang tên bản
sao đó. Với một skill đã cài dưới dạng plugin, bản sao tạm không bao giờ là thứ được chọn, nên mọi
query đọc ra 0 trigger.

Case dương 0 trigger là trượt. Case âm 0 trigger là đạt. Vậy một lượt chạy mà không có gì hoạt động
vẫn báo chừng một nửa bộ case đạt. Đo trên `atk:review`, một lượt chạy không nói lên điều gì hết in
ra `11/21 passed`, trong đó không có lấy một case dương.

Hễ thấy điểm số đi kèm 0 trigger ở mọi case thì kết luận là bộ chạy hỏng, đừng bao giờ kết luận là
description có vấn đề.

## Cách đo được

Hook `PreToolUse` với matcher `Skill` bắn khi model chọn một skill, và payload của nó mang
`tool_input.skill`, tức tên skill thắng cuộc. Phép đo nằm ở đó: chạy query trong một phiên con có
đăng ký hook này, rồi đọc xem model với tay tới skill nào, hoặc không skill nào.

Hook đáng giá hơn một chữ đạt hay trượt, vì tên skill thắng chính là phần chẩn đoán. Một case âm đẩy
query sang đúng skill anh em sở hữu nó nghĩa là ranh giới đang đứng vững. Một case dương thua cho
biết description nào đã nói mạnh hơn description của bạn, và thua ở ngôn ngữ nào.

## Ba điều kiện, mỗi điều kiện đổi bằng một lần làm sai

**Dự án mồi phải có việc thật.** Trong một thư mục trắng, model không gọi skill nào cả, với bất kỳ
query nào, và kết quả không phân biệt được với một description chẳng khớp gì. Hãy đưa cho phiên con
một repository có commit, có thay đổi chưa commit, có nhánh, có tài liệu yêu cầu và tài liệu thiết
kế, để skill nào đang được đo cũng có cái để làm. Bộ chạy sao chép nguyên trạng repository chứa
skill, nên phép đo chỉ tốt bằng những gì repository đó đang có; hãy chạy từ một thư mục làm việc đang có
việc dở dang.

**Các kit khác phải ở ngoài phòng.** Nếu dùng chính cấu hình của người bảo trì thì mọi plugin đã cài
đều tranh nhau, mà thua một skill của kit khác thì không nói được gì về một team chỉ cài mỗi kit
này. Hãy chạy với `CLAUDE_CONFIG_DIR` trỏ vào một thư mục chỉ chứa file credentials, và nạp kit bằng
`--plugin-dir` trỏ vào plugin, tức `plugins/atk/` trong repository.

**Skill dựng sẵn của Claude Code thì ở lại trong phòng.** Skill `code-review` dựng sẵn không gỡ được
và cũng không nên gỡ: một team dùng kit này trên Claude Code gặp đúng cuộc cạnh tranh đó. Khi một
case dương thua về tay skill dựng sẵn thì đó là phát hiện thật, và lối ra hoặc là sửa `description`
để nó nói rõ phần mà skill của kit làm còn skill dựng sẵn không làm, hoặc là sửa lại kỳ vọng của
case, vì kỳ vọng đó sai.

## Chạy một lượt

Bộ chạy nằm trong `atkx`, ngay trong skill dùng nó: `atkx:skill-eval --trigger` gọi nó, còn hai
script của nó ở `plugins/atkx/skills/skill-eval/scripts/`. `hook-log.mjs` là hook mà mọi phiên con
chạy, còn `trigger-run.mjs` dựng bản sao mồi và config cô lập, khởi chạy các phiên, đếm kết quả rồi
dọn sạch. Reference của nó, `plugins/atkx/skills/skill-eval/references/trigger-mode.md`, giữ các
bước, lời xin đồng ý trước khi mở bất kỳ phiên nào, quy tắc về thông tin đăng nhập, và cách dọn dẹp.

```bash
node plugins/atkx/skills/skill-eval/scripts/trigger-run.mjs plugins/atk/skills/review --dry-run
node plugins/atkx/skills/skill-eval/scripts/trigger-run.mjs plugins/atk/skills/review --yes --read <codeDigest> --runs 3 --model sonnet
```

`--dry-run` đếm số phiên, không sao chép gì và không mở phiên nào, đồng thời in `codeFiles` và
`codeDigest` với plugin có đăng ký tiến trình; `--yes` chạy chúng, mỗi lúc ba phiên, và với plugin
như vậy chỉ chạy khi có `--read` mang đúng digest đó, sau khi người dùng đã đọc các file ấy. Hook
ghi lại lượt gọi `Skill` rồi từ chối lượt gọi đó, nên skill được chọn không bao giờ chạy
trong bản mồi, và bộ chạy dừng phiên ngay khi lượt gọi đầu tiên được ghi, vì sau đó không còn gì
được đếm. Dừng ở đó thì một phiên chỉ mất vài giây, thay vì vài phút cho trọn một lượt chạy skill.
Bản mồi bỏ ra ngoài `.claude/settings*.json` của chính repository, và bộ chạy từ chối một skill mà
phần kiểm tra tĩnh tìm ra credential hoặc lỗi cổng bảo mật. Skill trong plugin vẫn được nạp cùng
các tiến trình mà plugin đăng ký, gồm hook, monitor, LSP server và MCP server. Cổng kiểm tra đọc
mọi lệnh cùng các file lệnh đó nêu tên, và từ chối lệnh chạy một file nằm ngoài plugin; lời xin đồng
ý trước khi chạy hiển thị đầy đủ mọi file văn bản còn lại của plugin, và các phiên nạp một bản sao
được đối chiếu với đúng digest đã hiển thị, nên thứ chạy chính là thứ đã được hiển thị; bản thân
cổng chỉ tìm các mẫu đã biết, còn việc đọc mã mới là thứ phán xét phần còn lại.

Một trigger là một phiên mà payload `Skill` *đầu tiên* được ghi có `tool_input.skill` bằng đúng tên
đầy đủ của skill đang đo, `atk:<tên>` với skill của kit này. So khớp chính xác. Nếu chỉ kiểm tên
skill có nằm trong giá trị đó không thì `code-review` dựng sẵn sẽ được tính thành một lượt trúng của
`review`, và đó cũng là kiểu đạt rỗng mà bộ chạy hỏng tạo ra, chỉ đi tới từ hướng ngược lại.

## Những giới hạn phải nói rõ trong mọi kết quả

**Case dạng slash command không quan sát được.** Một query như `/atk:review --strict` nở thẳng vào
prompt và không chạm tool nào, nên không hook nào và không sự kiện luồng nào nhìn thấy. Skill vẫn
chạy thật: phiên con nhận query đó có đọc reference của skill và trả lời đúng như skill. Chỉ là
không có tín hiệu nào để đếm. Hãy ghi những case đó là bỏ qua, đừng bao giờ ghi là đạt, và vẫn giữ
chúng trong file, vì chúng ghi lại dạng invocation ngay cả ở chỗ không gì đo được.

**Một lượt cho mỗi query thì chưa phải một phép đo.** Việc chọn skill không tất định. Chạy một lượt
thì không tách được tín hiệu khỏi nhiễu, và một case trượt xứng đáng được chạy lại ba lượt trước khi
ai đó sửa `description` vì nó.

**Một kết quả thuộc về một model và một phiên bản.** Hãy ghi lại model nào đã chạy. Một description
thắng dưới model này có thể thua dưới model khác, và một điểm số không kèm tên model thì không đem
so với lần đo sau được.

## Lần đo thật đầu tiên cho thấy gì

Chạy ngày 2026-09-18, skill `atk:review`, mỗi query một lượt, model sonnet: mười sáu trên mười chín
case quan sát được đã đạt, và cả mười một case âm đều đúng. Nửa case âm mới là phần thú vị. Cách nói
về test case đi sang `atk:qa`, cách nói về chạy thật đi sang `atk:verify`, cách nói về lỗi đi sang
`atk:fix`, cách nói về quy ước team đi sang `atk:convention`, còn câu nhờ tóm tắt một pull request
đi sang `atk:catchup`. Đó là ranh giới giữa các skill kề nhau đứng vững trong thực tế.

Trong ba case trượt, một case thua skill `code-review` dựng sẵn ở một câu tiếng Nhật trần trụi không
mang dấu hiệu nào của team, hai case còn lại không gọi skill nào, mà một trong hai là vì dự án mồi
không có pull request nào cho một query hỏi về pull request. Case cuối là lỗi của dự án mồi chứ
không phải của description, và giữ cho sự phân biệt đó khỏi lẫn lộn chính là lý do tài liệu này tồn
tại.
