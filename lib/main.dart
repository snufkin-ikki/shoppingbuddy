import 'package:flutter/material.dart';

void main() => runApp(const BuddyApp());

const areas = ['すべて','下北沢','渋谷・原宿','浅草・蔵前','秋葉原','神保町','京都','大阪・心斎橋','名古屋・栄','福岡・天神','仙台','札幌'];
const cats = ['すべて','衣','美','食','住','遊','電'];

class Request {
  Request(this.title, this.area, this.category, this.when, this.about, this.name);
  final String title, area, category, when, about, name;
}

class BuddyApp extends StatelessWidget {
  const BuddyApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Shopping Buddy',
    theme: ThemeData(useMaterial3: true, colorSchemeSeed: const Color(0xFF36594B), scaffoldBackgroundColor: const Color(0xFFF7F6F2)),
    home: const Board(),
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

  void createRequest() {
    final title = TextEditingController();
    final about = TextEditingController();
    String newArea = areas[1], newCategory = '遊';
    showModalBottomSheet<void>(
      context: context, isScrollControlled: true, backgroundColor: Colors.white,
      builder: (sheetContext) => StatefulBuilder(builder: (context, refresh) => Padding(
        padding: EdgeInsets.fromLTRB(22, 24, 22, MediaQuery.viewInsetsOf(context).bottom + 24),
        child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('相方を募る', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          TextField(controller: title, decoration: const InputDecoration(labelText: '募集タイトル', hintText: '例：古着屋を一緒に巡りたい')),
          const SizedBox(height: 10),
          DropdownButtonFormField<String>(value: newArea, decoration: const InputDecoration(labelText: 'エリア'), items: areas.skip(1).map((x) => DropdownMenuItem(value: x, child: Text(x))).toList(), onChanged: (x) => refresh(() => newArea = x ?? newArea)),
          const SizedBox(height: 10),
          DropdownButtonFormField<String>(value: newCategory, decoration: const InputDecoration(labelText: 'カテゴリ'), items: cats.skip(1).map((x) => DropdownMenuItem(value: x, child: Text(x))).toList(), onChanged: (x) => refresh(() => newCategory = x ?? newCategory)),
          const SizedBox(height: 10),
          TextField(controller: about, minLines: 3, maxLines: 5, decoration: const InputDecoration(labelText: 'やりたいこと')),
          const SizedBox(height: 18),
          SizedBox(width: double.infinity, child: FilledButton(onPressed: () {
            if (title.text.trim().isEmpty) return;
            setState(() => requests.insert(0, Request(title.text.trim(), newArea, newCategory, '日時を相談', about.text.trim().isEmpty ? '詳細はBuddyと相談して決めます。' : about.text.trim(), 'あなた')));
            Navigator.pop(sheetContext);
            ScaffoldMessenger.of(this.context).showSnackBar(const SnackBar(content: Text('募集を公開しました（デモ表示）')));
          }, child: const Text('募集を公開する'))),
        ])),
      )),
    ).whenComplete(() { title.dispose(); about.dispose(); });
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    floatingActionButton: FloatingActionButton.extended(onPressed: createRequest, icon: const Icon(Icons.add), label: const Text('相方を募る')),
    body: SafeArea(child: CustomScrollView(slivers: [
      SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.fromLTRB(20, 18, 20, 10), child: Row(children: [
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
          subtitle: Padding(padding: const EdgeInsets.only(top: 8), child: Text(r.area + ' · ' + r.when + '\n' + r.about + '\n' + r.name + ' · 募集受付中')),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => showModalBottomSheet<void>(context: context, isScrollControlled: true, builder: (ctx) => Padding(padding: const EdgeInsets.all(24), child: SafeArea(child: Wrap(runSpacing: 12, children: [
            Text(r.area + ' · ' + r.category, style: const TextStyle(color: Color(0xFF36594B), fontWeight: FontWeight.bold)),
            Text(r.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text('募集者 ' + r.name + '　プロフィールを見る'),
            Text(r.about),
            Text('希望日時：' + r.when),
            const Text('待ち合わせ場所はマッチング後に公開'),
            const Text('募集者が期限内にBuddyを1人選びます'),
            SizedBox(width: double.infinity, child: FilledButton(onPressed: () => ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('応募には登録とBuddy本人確認が必要です'))), child: const Text('この募集に応募する'))),
          ])))),
        ));
      }, childCount: shown.length))),
    ])),
  );
}
