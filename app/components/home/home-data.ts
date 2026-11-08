export type Article = {
  id: string;
  author: string;
  publication: string;
  date: string;
  title: string;
  excerpt: string;
  readTime: string;
  reactions: string;
  comments: string;
  topic: string;
  image: string;
  avatar: string;
};

export const articles: Article[] = [
  { id: "ai-tools", author: "林墨", publication: "工程师的第二大脑", date: "今天", title: "AI 不会替代开发者，但会重新定义优秀开发者", excerpt: "从工具使用到系统思考，我们正在进入一个新的工程协作时代。", readTime: "6 分钟阅读", reactions: "1.2K", comments: "86", topic: "人工智能", image: "linear-gradient(135deg, #dce8ff 0%, #9daeea 48%, #4656a4 100%)", avatar: "LM" },
  { id: "design-engineer", author: "周一", publication: "产品与代码", date: "昨天", title: "为什么我在 2026 年招聘设计工程师", excerpt: "设计、用户体验和代码之间的边界正在变得越来越有趣。", readTime: "4 分钟阅读", reactions: "846", comments: "31", topic: "职业成长", image: "linear-gradient(135deg, #f7d99c 0%, #eaa9c4 52%, #7553a5 100%)", avatar: "ZY" },
  { id: "knowledge-base", author: "陈曦", publication: "开源观察", date: "5 月 18 日", title: "把一次排障记录，变成团队可以复用的知识", excerpt: "好的技术文章不只是答案，也应该让下一个人少走一段弯路。", readTime: "8 分钟阅读", reactions: "512", comments: "24", topic: "工程实践", image: "linear-gradient(135deg, #b5e5d1 0%, #7db7d9 52%, #3b4d8e 100%)", avatar: "CX" },
];

export const staffPicks = [
  { title: "技术团队如何建立真正有效的写作文化", author: "Dev-Mind Staff", date: "6 月 2 日" },
  { title: "从一个小组件开始，重新理解设计系统", author: "周一", date: "5 月 30 日" },
  { title: "我们为什么需要更慢、更有耐心的工程", author: "林墨", date: "5 月 26 日" },
];

export const topics = ["人工智能", "工程实践", "职业成长", "产品设计", "开源项目"];
