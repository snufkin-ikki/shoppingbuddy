import 'package:flutter/material.dart';

void main() => runApp(const BuddyApp());

const areas = ['すべて','下北沢','渋谷・原宿','浅草・蔵前','秋葉原','神保町','京都','大阪・心斎橋','名古屋・栄','福岡・天神','仙台','札幌'];
const cats = ['すべて','衣','美','食','住','遊','電'];

class Request {
  Request(this.title, this.area, this.category, this.when, this.about, this.name,
      {this.duration = 60});
  final String title, area, category, when, about, name;
  final int duration;
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
          onTap: () => showModalBottomSheet<void>(context: context, isScrollControlled: true, builder: (ctx) => Padding(padding: const EdgeInsets.all(24), child: SafeArea(child: Wrap(runSpacing: 12, children: [
            Text(r.area + ' · ' + r.category, style: const TextStyle(color: Color(0xFF36594B), fontWeight: FontWeight.bold)),
            Text(r.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text('募集者 ' + r.name + '　プロフィールを見る'),
            Text(r.about),
            Text('希望日時：' + r.when),
            Text('予定時間：' + r.duration.toString() + '分'),
            const Text('待ち合わせ場所はマッチング後に公開'),
            const Text('募集者が期限内にBuddyを1人選びます'),
            SizedBox(width: double.infinity, child: FilledButton(onPressed: () => ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('応募には登録とBuddy本人確認が必要です'))), child: const Text('この募集に応募する'))),
          ])))),
        ));
      }, childCount: shown.length))),
    ])),
  );
}
