import 'package:flutter/material.dart';

void main() => runApp(const BuddyApp());

const areas = ['すべて','下北沢','渋谷・原宿','浅草・蔵前','秋葉原','神保町','京都','大阪・心斎橋','名古屋・栄','福岡・天神','仙台','札幌'];
const cats = ['すべて','衣','美','食','住','遊','電'];

class DemoApplicant {
  const DemoApplicant(
    this.name, this.tagline, this.tags, this.rate, this.ratePer30m,
  );
  final String name, tagline, tags, rate;
  final int ratePer30m;
}

const demoApplicants = [
  DemoApplicant('Mana', '古着と小さなギャラリーが好き', '衣・遊', '1,000円 / 30分', 1000),
  DemoApplicant('Kai', '街の喫茶店や雑貨屋を案内します', '食・住', '1,500円 / 30分', 1500),
];

class Request {
  Request(this.title, this.area, this.category, this.when, this.about, this.name,
      {this.duration = 60, this.isMine = false});
  final String title, area, category, when, about, name;
  final int duration;
  final bool isMine;
  String? selectedBuddy;
  bool appliedByDemoBuddy = false;
}

class BuddyApp extends StatelessWidget {
  const BuddyApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Shopping Buddy',
    theme: ThemeData(useMaterial3: true, colorSchemeSeed: const Color(0xFF36594B), scaffoldBackgroundColor: const Color(0xFFF7F6F2)),
    home: const BuddyDirectory(),
  );
}


class BuddyDirectory extends StatefulWidget {
  const BuddyDirectory({super.key});

  @override
  State<BuddyDirectory> createState() => _BuddyDirectoryState();
}

class _BuddyDirectoryState extends State<BuddyDirectory> {
  String area = '下北沢';

  final buddies = const [
    {'name': 'Mana', 'tagline': '古着と小さなギャラリーが好き', 'tags': '衣・遊', 'rate': '1,000円 / 30分', 'initial': 'M'},
    {'name': 'Kai', 'tagline': '街の喫茶店や雑貨屋を案内します', 'tags': '食・住', 'rate': '1,500円 / 30分', 'initial': 'K'},
    {'name': 'Yuki', 'tagline': '初めての街歩きも気軽にどうぞ', 'tags': '美・遊', 'rate': '1,200円 / 30分', 'initial': 'Y'},
  ];

  void openPublicBoard() {
    Navigator.of(context).push(MaterialPageRoute<void>(
      builder: (_) => const Board(),
    ));
  }

  void requireSignIn() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('ログイン連携準備中')),
    );
  }

  void openInvite(Map<String, String> buddy) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      builder: (_) => InviteSheet(buddyName: buddy['name']!),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('shopping buddy', style: TextStyle(fontWeight: FontWeight.w800)),
      actions: [
        TextButton(
          onPressed: requireSignIn,
          child: const Text('ログイン'),
        ),
      ],
    ),
    body: ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
      children: [
        const Text(
          '街を知るBuddyと、\nいつもの買い物をもっと楽しく。',
          style: TextStyle(fontSize: 27, height: 1.25, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        const Text('プロフィールから相手を選んで、街歩きに誘えます。'),
        const SizedBox(height: 22),
        DropdownButtonFormField<String>(
          value: area,
          decoration: const InputDecoration(
            labelText: 'エリア',
            prefixIcon: Icon(Icons.place_outlined),
            border: OutlineInputBorder(),
          ),
          items: areas.skip(1).map((item) =>
            DropdownMenuItem(value: item, child: Text(item))).toList(),
          onChanged: (value) => setState(() => area = value ?? area),
        ),
        const SizedBox(height: 20),
        Text(
          area + 'のBuddy',
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        ...buddies.map((buddy) => Card(
          color: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  CircleAvatar(
                    backgroundColor: const Color(0xFFE9EEE9),
                    child: Text(buddy['initial']!, style: const TextStyle(color: Color(0xFF36594B), fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Text(buddy['name']!, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 6),
                        const Icon(Icons.verified, size: 16, color: Color(0xFF36594B)),
                        const Text(' DEMO', style: TextStyle(fontSize: 10, color: Color(0xFF81837D))),
                      ]),
                      Text(buddy['tagline']!, style: const TextStyle(fontSize: 13)),
                    ],
                  )),
                ]),
                const SizedBox(height: 10),
                Text('カテゴリ：' + buddy['tags']!),
                const SizedBox(height: 4),
                Text('料金：' + buddy['rate']!, style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => openInvite(buddy),
                    child: const Text('このBuddyを誘う'),
                  ),
                ),
              ],
            ),
          ),
        )),
        const SizedBox(height: 18),
        OutlinedButton.icon(
          onPressed: openPublicBoard,
          icon: const Icon(Icons.campaign_outlined),
          label: const Text('Buddyを決めずに「相方を募る」'),
        ),
      ],
    ),
  );
}


class InviteSheet extends StatefulWidget {
  const InviteSheet({super.key, required this.buddyName});
  final String buddyName;

  @override
  State<InviteSheet> createState() => _InviteSheetState();
}

class _InviteSheetState extends State<InviteSheet> {
  String category = '遊';
  String timing = '今すぐ・当日';
  int duration = 60;
  DateTime? scheduledAt;

  Future<void> chooseDateTime() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(now),
    );
    if (time == null || !mounted) return;
    setState(() => scheduledAt = DateTime(
      date.year, date.month, date.day, time.hour, time.minute,
    ));
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.fromLTRB(
      22, 22, 22, MediaQuery.viewInsetsOf(context).bottom + 24,
    ),
    child: SafeArea(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Buddyを誘う', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(widget.buddyName + 'さんに予定を送ります'),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: category,
              decoration: const InputDecoration(labelText: 'カテゴリ'),
              items: cats.skip(1).map((item) =>
                DropdownMenuItem(value: item, child: Text(item))).toList(),
              onChanged: (value) => setState(() => category = value ?? category),
            ),
            const SizedBox(height: 12),
            const Text('希望タイミング', style: TextStyle(fontWeight: FontWeight.w700)),
            RadioListTile<String>(
              contentPadding: EdgeInsets.zero,
              title: const Text('今すぐ・当日'),
              value: '今すぐ・当日',
              groupValue: timing,
              onChanged: (value) => setState(() => timing = value!),
            ),
            RadioListTile<String>(
              contentPadding: EdgeInsets.zero,
              title: const Text('日時を決めて予約'),
              value: '日時指定',
              groupValue: timing,
              onChanged: (value) => setState(() => timing = value!),
            ),
            if (timing == '日時指定')
              OutlinedButton.icon(
                onPressed: chooseDateTime,
                icon: const Icon(Icons.calendar_month_outlined),
                label: Text(scheduledAt == null
                  ? '希望日時を選ぶ'
                  : MaterialLocalizations.of(context).formatMediumDate(scheduledAt!) +
                    ' ' + TimeOfDay.fromDateTime(scheduledAt!).format(context)),
              ),
            const SizedBox(height: 8),
            const Text('予定時間', style: TextStyle(fontWeight: FontWeight.w700)),
            Wrap(
              spacing: 8,
              children: [30, 60, 90, 120].map((minutes) =>
                ChoiceChip(
                  label: Text(minutes.toString() + '分'),
                  selected: duration == minutes,
                  onSelected: (_) => setState(() => duration = minutes),
                )).toList(),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: timing == '日時指定' && scheduledAt == null
                  ? null
                  : () => ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('お誘いの送信には登録・ログインが必要です')),
                    ),
                child: const Text('この内容で誘う'),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class RequestComposer extends StatefulWidget {
  const RequestComposer({super.key, required this.initialArea});
  final String initialArea;

  @override
  State<RequestComposer> createState() => _RequestComposerState();
}

class _RequestComposerState extends State<RequestComposer> {
  final formKey = GlobalKey<FormState>();
  final titleController = TextEditingController();
  final aboutController = TextEditingController();
  late String area = widget.initialArea;
  String category = '遊';
  String timing = '今すぐ・当日';
  int duration = 60;
  DateTime? scheduledAt;

  @override
  void dispose() {
    titleController.dispose();
    aboutController.dispose();
    super.dispose();
  }

  Future<void> chooseDateTime() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(now),
    );
    if (time == null || !mounted) return;
    setState(() => scheduledAt = DateTime(
      date.year, date.month, date.day, time.hour, time.minute,
    ));
  }

  String get whenLabel {
    if (timing == '今すぐ・当日') return timing;
    if (scheduledAt == null) return '日時を選択してください';
    return MaterialLocalizations.of(context).formatMediumDate(scheduledAt!) +
        ' ' + TimeOfDay.fromDateTime(scheduledAt!).format(context);
  }

  void submit() {
    if (!(formKey.currentState?.validate() ?? false)) return;
    if (timing == '日時指定' && scheduledAt == null) return;
    Navigator.of(context).pop(Request(
      titleController.text.trim(),
      area,
      category,
      whenLabel,
      aboutController.text.trim().isEmpty
          ? '行きたい場所や希望を相談しながら決めたいです。'
          : aboutController.text.trim(),
      'あなた',
      duration: duration,
      isMine: true,
    ));
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.fromLTRB(
      22, 22, 22, MediaQuery.viewInsetsOf(context).bottom + 24,
    ),
    child: SafeArea(
      child: SingleChildScrollView(
        child: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('相方を募る', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              const Text('行きたい街や過ごし方を書いて、Buddyからの応募を待ちます。'),
              const SizedBox(height: 14),
              DropdownButtonFormField<String>(
                value: area,
                decoration: const InputDecoration(labelText: 'エリア'),
                items: areas.skip(1).map((item) =>
                  DropdownMenuItem(value: item, child: Text(item))).toList(),
                onChanged: (value) => setState(() => area = value ?? area),
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: category,
                decoration: const InputDecoration(labelText: 'ジャンル'),
                items: cats.skip(1).map((item) =>
                  DropdownMenuItem(value: item, child: Text(item))).toList(),
                onChanged: (value) => setState(() => category = value ?? category),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: titleController,
                maxLength: 40,
                decoration: const InputDecoration(
                  labelText: '募集タイトル',
                  hintText: '例：下北沢で古着屋を一緒に巡りたい',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value == null || value.trim().isEmpty
                    ? 'タイトルを入力してください'
                    : null,
              ),
              TextFormField(
                controller: aboutController,
                maxLength: 240,
                minLines: 2,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'やりたいこと・希望（任意）',
                  hintText: '行きたい場所や探しているものを書いてください',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 8),
              const Text('希望タイミング', style: TextStyle(fontWeight: FontWeight.w700)),
              RadioListTile<String>(
                contentPadding: EdgeInsets.zero,
                title: const Text('今すぐ・当日'),
                value: '今すぐ・当日',
                groupValue: timing,
                onChanged: (value) => setState(() => timing = value!),
              ),
              RadioListTile<String>(
                contentPadding: EdgeInsets.zero,
                title: const Text('日時を決めて予約'),
                value: '日時指定',
                groupValue: timing,
                onChanged: (value) => setState(() => timing = value!),
              ),
              if (timing == '日時指定')
                OutlinedButton.icon(
                  onPressed: chooseDateTime,
                  icon: const Icon(Icons.calendar_month_outlined),
                  label: Text(scheduledAt == null ? '希望日時を選ぶ' : whenLabel),
                ),
              const SizedBox(height: 8),
              const Text('予定時間', style: TextStyle(fontWeight: FontWeight.w700)),
              Wrap(
                spacing: 8,
                children: [30, 60, 90, 120].map((minutes) =>
                  ChoiceChip(
                    label: Text(minutes.toString() + '分'),
                    selected: duration == minutes,
                    onSelected: (_) => setState(() => duration = minutes),
                  )).toList(),
              ),
              const SizedBox(height: 14),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F5F2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'デモ画面です。投稿の公開とBuddyへの応募には、実サービスでは登録・ログインが必要です。',
                  style: TextStyle(fontSize: 12),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: timing == '日時指定' && scheduledAt == null
                      ? null
                      : submit,
                  child: const Text('募集内容を確認する'),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class DemoChatSheet extends StatefulWidget {
  const DemoChatSheet({super.key, required this.request, required this.buddy});
  final Request request;
  final DemoApplicant buddy;

  @override
  State<DemoChatSheet> createState() => _DemoChatSheetState();
}

class _DemoChatSheetState extends State<DemoChatSheet> {
  final controller = TextEditingController();
  final messages = <String>[
    '募集を見て応募しました。ご希望のお店や過ごし方を教えてください。',
  ];

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void send() {
    final message = controller.text.trim();
    if (message.isEmpty) return;
    setState(() {
      messages.add(message);
      controller.clear();
    });
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.fromLTRB(
      20, 20, 20, MediaQuery.viewInsetsOf(context).bottom + 20,
    ),
    child: SafeArea(
      child: SizedBox(
        height: MediaQuery.sizeOf(context).height * 0.72,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.buddy.name + 'さんと相談',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(widget.request.area + ' · ' + widget.request.title,
              maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 8),
            const Text('デモチャット · 内容を決めてから支払いに進みます',
              style: TextStyle(fontSize: 12, color: Color(0xFF6B706B))),
            const Divider(height: 20),
            Expanded(
              child: ListView(
                children: [
                  ...messages.map((message) => Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8, right: 36),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE9EEE9),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text(message),
                    ),
                  )),
                ],
              ),
            ),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    decoration: const InputDecoration(
                      hintText: 'メッセージを入力',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                    onSubmitted: (_) => send(),
                  ),
                ),
                IconButton(
                  onPressed: send,
                  icon: const Icon(Icons.send),
                  tooltip: '送信',
                ),
              ],
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('内容を確認して支払いへ'),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class DemoPaymentSheet extends StatelessWidget {
  const DemoPaymentSheet({super.key, required this.request, required this.buddy});
  final Request request;
  final DemoApplicant buddy;

  @override
  Widget build(BuildContext context) {
    final amount = buddy.ratePer30m * request.duration ~/ 30;
    return Padding(
      padding: const EdgeInsets.all(24),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('お支払い内容',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 14),
            Text('Buddy：' + buddy.name + 'さん'),
            Text('予定：' + request.area + ' · ' + request.when),
            Text('時間：' + request.duration.toString() + '分'),
            const Divider(height: 24),
            Text('Buddy料金（デモ）：' + amount.toString() + '円',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('カード払い（Stripe連携予定）'),
            const SizedBox(height: 8),
            const Text(
              'デモ金額です。実サービスでは決済前に確定金額を表示します。',
              style: TextStyle(fontSize: 12, color: Color(0xFF6B706B)),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('カード決済へ進む（デモ）'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class DemoMeetupSheet extends StatefulWidget {
  const DemoMeetupSheet({super.key, required this.request, required this.buddy});
  final Request request;
  final DemoApplicant buddy;

  @override
  State<DemoMeetupSheet> createState() => _DemoMeetupSheetState();
}

class _DemoMeetupSheetState extends State<DemoMeetupSheet> {
  bool requesterDone = false;
  bool buddyDone = false;
  bool ratingSent = false;
  int rating = 0;
  final selectedTags = <String>{};
  static const tags = [
    '話しやすい', '街に詳しい', '提案が上手', '気配りがある',
    '時間を守る', 'また会いたい',
  ];

  @override
  Widget build(BuildContext context) {
    final bothDone = requesterDone && buddyDone;
    return Padding(
      padding: EdgeInsets.fromLTRB(
        22, 22, 22, MediaQuery.viewInsetsOf(context).bottom + 24,
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('お出かけの完了確認',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              const Text('デモ画面 · 実際の予約・決済は行われていません'),
              const SizedBox(height: 14),
              Text(widget.request.area + ' · ' + widget.request.title),
              Text(widget.buddy.name + 'さん · ' + widget.request.duration.toString() + '分'),
              const SizedBox(height: 14),
              Card(
                color: const Color(0xFFF3F5F2),
                child: Column(
                  children: [
                    ListTile(
                      leading: Icon(
                        requesterDone ? Icons.check_circle : Icons.radio_button_unchecked,
                        color: const Color(0xFF36594B),
                      ),
                      title: const Text('利用者の完了確認'),
                      subtitle: Text(requesterDone ? '完了' : '確認待ち'),
                    ),
                    ListTile(
                      leading: Icon(
                        buddyDone ? Icons.check_circle : Icons.radio_button_unchecked,
                        color: const Color(0xFF36594B),
                      ),
                      title: const Text('Buddyの完了確認'),
                      subtitle: Text(buddyDone ? '完了' : '確認待ち'),
                    ),
                  ],
                ),
              ),
              if (!bothDone) ...[
                const SizedBox(height: 10),
                if (!requesterDone)
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.tonal(
                      onPressed: () => setState(() => requesterDone = true),
                      child: const Text('利用者側の完了を確認（デモ）'),
                    ),
                  ),
                if (requesterDone && !buddyDone) ...[
                  const SizedBox(height: 6),
                  const Text(
                    'Buddy側の確認を待っています。デモでは下のボタンで相手側の確認も試せます。',
                    style: TextStyle(fontSize: 12),
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => setState(() => buddyDone = true),
                      child: const Text('Buddy側も完了にする（デモ）'),
                    ),
                  ),
                ],
              ] else if (ratingSent) ...[
                const SizedBox(height: 12),
                const Card(
                  color: Color(0xFFE9EEE9),
                  child: ListTile(
                    leading: Icon(Icons.check_circle, color: Color(0xFF36594B)),
                    title: Text('評価を送信しました（デモ）'),
                    subtitle: Text('実際の評価データは保存されていません'),
                  ),
                ),
              ] else ...[
                const SizedBox(height: 12),
                const Text('両者の完了を確認しました。Buddyを評価してください。',
                  style: TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [1, 2, 3, 4, 5].map((value) => ChoiceChip(
                    label: Text('★' * value),
                    selected: rating == value,
                    onSelected: (_) => setState(() => rating = value),
                  )).toList(),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: tags.map((tag) => FilterChip(
                    label: Text(tag),
                    selected: selectedTags.contains(tag),
                    onSelected: (selected) => setState(() {
                      if (selected) {
                        selectedTags.add(tag);
                      } else {
                        selectedTags.remove(tag);
                      }
                    }),
                  )).toList(),
                ),
                const SizedBox(height: 8),
                const Text('完了後24時間はチャットを利用できます。',
                  style: TextStyle(fontSize: 12, color: Color(0xFF6B706B))),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: rating == 0
                        ? null
                        : () => setState(() => ratingSent = true),
                    child: const Text('評価を送信（デモ）'),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class Board extends StatefulWidget {
  const Board({super.key});
  @override
  State<Board> createState() => _BoardState();
}

class _BoardState extends State<Board> {
  String area = 'すべて', category = 'すべて';
  final requests = <Request>[
    Request('古着屋を一緒に巡りたい','下北沢','衣','今日 15:00ごろ','初めてなので、おすすめのお店を教えてください！','Mika'),
    Request('浅草で器と雑貨を見たい','浅草・蔵前','住','明日 13:00','蔵前にも足を伸ばして、暮らしの道具を見たいです。','Alex'),
    Request('神保町の古本屋を案内してほしい','神保町','遊','10月24日 11:00','写真集やデザイン本を探しています。','Daniel'),
    Request('京都でお茶と甘味を楽しみたい','京都','食','10月25日 14:00','地元の人が行くお店にも行ってみたいです。','Yui'),
  ];
  List<Request> get shown => requests.where((r) => (area == 'すべて' || r.area == area) && (category == 'すべて' || r.category == category)).toList();

  Future<void> openChatAndPayment(Request request, DemoApplicant buddy) async {
    final agreed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      builder: (_) => DemoChatSheet(request: request, buddy: buddy),
    );
    if (agreed != true || !mounted) return;
    final paid = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      builder: (_) => DemoPaymentSheet(request: request, buddy: buddy),
    );
    if (paid == true && mounted) {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.white,
        builder: (_) => DemoMeetupSheet(request: request, buddy: buddy),
      );
    }
  }

  Future<void> openComposer() async {
    final request = await showModalBottomSheet<Request>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      builder: (_) => RequestComposer(
        initialArea: area == 'すべて' ? areas[1] : area,
      ),
    );
    if (request == null || !mounted) return;
    setState(() {
      requests.insert(0, request);
      area = request.area;
      category = 'すべて';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('デモ投稿として一覧に追加しました。公開には登録・ログインが必要です'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    floatingActionButton: FloatingActionButton.extended(onPressed: openComposer, icon: const Icon(Icons.add), label: const Text('相方を募る')),
    body: SafeArea(child: CustomScrollView(slivers: [
      SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.fromLTRB(12, 18, 20, 10), child: Row(children: [
        IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.arrow_back)),
        const Icon(Icons.explore, color: Color(0xFF36594B)), const SizedBox(width: 8),
        const Text('shopping buddy', style: TextStyle(fontWeight: FontWeight.w800)),
        const Spacer(), TextButton(onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('ログイン連携準備中'))), child: const Text('ログイン')),
      ]))),
      const SliverToBoxAdapter(child: Padding(padding: EdgeInsets.fromLTRB(20, 24, 20, 20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('街のカルチャーを、', style: TextStyle(fontSize: 29, height: 1.15, fontWeight: FontWeight.w800)),
        Text('誰かと楽しもう。', style: TextStyle(fontSize: 29, height: 1.15, fontWeight: FontWeight.w800)),
        SizedBox(height: 10), Text('行きたい場所ややりたいことを投稿して、地元のBuddyと出会おう。'),
        SizedBox(height: 12), Text('✓ 応募できるのは本人確認済みBuddyです', style: TextStyle(color: Color(0xFF36594B), fontWeight: FontWeight.w600)),
      ]))),
      SliverToBoxAdapter(child: SizedBox(height: 48, child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), children: areas.map((x) => Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: ChoiceChip(label: Text(x), selected: area == x, onSelected: (_) => setState(() => area = x)))).toList()))),
      SliverToBoxAdapter(child: SizedBox(height: 48, child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16), children: cats.map((x) => Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: ChoiceChip(label: Text(x), selected: category == x, onSelected: (_) => setState(() => category = x)))).toList()))),
      SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.fromLTRB(20, 18, 20, 12), child: Text('相方募集  (' + shown.length.toString() + '件)', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)))),
      SliverPadding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 100), sliver: SliverList(delegate: SliverChildBuilderDelegate((context, i) {
        final r = shown[i];
        return Card(margin: const EdgeInsets.only(bottom: 12), color: Colors.white, child: ListTile(
          contentPadding: const EdgeInsets.all(16), title: Text(r.title, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Padding(padding: const EdgeInsets.only(top: 8), child: Text(r.area + ' · ' + r.when + ' · ' + r.duration.toString() + '分\n' + r.about + '\n' + r.name + ' · 募集受付中')),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => showModalBottomSheet<void>(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.white,
            builder: (ctx) => Padding(
              padding: EdgeInsets.fromLTRB(
                24, 24, 24, MediaQuery.viewInsetsOf(ctx).bottom + 24,
              ),
              child: SafeArea(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(r.area + ' · ' + r.category,
                        style: const TextStyle(color: Color(0xFF36594B), fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(r.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('募集者 ' + r.name),
                      const SizedBox(height: 8),
                      Text(r.about),
                      const SizedBox(height: 8),
                      Text('希望日時：' + r.when),
                      Text('予定時間：' + r.duration.toString() + '分'),
                      const SizedBox(height: 8),
                      const Text('待ち合わせ場所はマッチング後に公開'),
                      const SizedBox(height: 12),
                      if (r.isMine) ...[
                        const Text('応募者（募集者だけが見られます）',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 8),
                        if (r.selectedBuddy != null)
                          Card(
                            color: const Color(0xFFE9EEE9),
                            child: ListTile(
                              leading: const Icon(Icons.check_circle, color: Color(0xFF36594B)),
                              title: Text(r.selectedBuddy! + 'さんを選択しました'),
                              subtitle: const Text('チャットで内容を相談してから支払いに進みます'),
                              trailing: TextButton(
                                onPressed: () {
                                  final buddy = demoApplicants.firstWhere(
                                    (item) => item.name == r.selectedBuddy,
                                  );
                                  openChatAndPayment(r, buddy);
                                },
                                child: const Text('チャット'),
                              ),
                            ),
                          )
                        else ...demoApplicants.map((applicant) => Card(
                          color: Colors.white,
                          child: ListTile(
                            leading: const CircleAvatar(child: Text('DEMO')),
                            title: Text(applicant.name + ' · DEMO',
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text(applicant.tagline + '\\n' +
                              applicant.tags + ' · ' + applicant.rate),
                            trailing: FilledButton.tonal(
                              onPressed: () {
                                setState(() => r.selectedBuddy = applicant.name);
                                Navigator.of(ctx).pop();
                                WidgetsBinding.instance.addPostFrameCallback((_) {
                                  if (mounted) openChatAndPayment(r, applicant);
                                });
                              },
                              child: const Text('この人を選ぶ'),
                            ),
                          ),
                        )),
                        const SizedBox(height: 8),
                        const Text('デモ用の応募者です。実際の応募情報はまだ保存されません。',
                          style: TextStyle(fontSize: 12, color: Color(0xFF6B706B))),
                      ] else ...[
                        if (r.appliedByDemoBuddy)
                          Card(
                            color: const Color(0xFFE9EEE9),
                            child: const ListTile(
                              leading: Icon(Icons.check_circle, color: Color(0xFF36594B)),
                              title: Text('Buddyとして応募済み（デモ）'),
                              subtitle: Text('募集者がBuddyを選ぶのを待っています'),
                            ),
                          )
                        else
                          SizedBox(
                            width: double.infinity,
                            child: FilledButton(
                              onPressed: () {
                                setState(() => r.appliedByDemoBuddy = true);
                                Navigator.of(ctx).pop();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('デモ応募を一覧に反映しました')),
                                );
                              },
                              child: const Text('Buddyとして応募する（デモ）'),
                            ),
                          ),
                        const Text(
                          'デモ操作です。実際の応募には登録とBuddy本人確認が必要です。',
                          style: TextStyle(fontSize: 12, color: Color(0xFF6B706B)),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ));
      }, childCount: shown.length))),
    ])),
  );
}
