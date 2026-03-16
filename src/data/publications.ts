export type PublicationItem = {
  id: string;
  title: string;
  arxivUrl: string;
  image: string;
  venue: string; // 新增：会议 / 期刊
};

export const publicationsData: PublicationItem[] = [
  {
    id: "GT^2-GS",
    title: "GT^2-GS: Geometry-aware Texture Transfer for Gaussian Splatting",
    arxivUrl: "https://arxiv.org/abs/2505.15208",
    image: "/vpx-assets/publications/gtgs.png",
    venue: "AAAI 2026",
  },
  {
    id: "Timesoccer",
    title: "Timesoccer: An end-to-end multimodal large language model for soccer commentary generation",
    arxivUrl: "https://dl.acm.org/doi/abs/10.1145/3746027.3755077",
    image: "/vpx-assets/publications/timesoccer.png",
    venue: "ACM MM 2025",
  },
  {
    id: "CeRF",
    title: "CeRF: Convolutional neural radiance derivative fields for new view synthesis",
    arxivUrl: "https://www.sciencedirect.com/science/article/pii/S0097849325002882",
    image: "/vpx-assets/publications/cerf.png",
    venue: "Computers & Graphics 2025",
  },
  {
    id: "ABC-GS",
    title: "ABC-GS: Alignment-Based Controllable Style Transfer for 3D Gaussian Splatting",
    arxivUrl: "https://arxiv.org/abs/2503.22218",
    image: "/vpx-assets/publications/abcgs.png",
    venue: "ICME 2025",
  },
  {
    id: "Chattracker",
    title: "Chattracker: Enhancing visual tracking performance via chatting with multimodal large language model",
    arxivUrl: "https://proceedings.neurips.cc/paper_files/paper/2024/hash/458567910b6d21f438f22aa20c036723-Abstract-Conference.html",
    image: "/vpx-assets/publications/chattracker.png",
    venue: "NeurIPS 2025",
  },
  {
    id: "Find",
    title: "Find: Fine-tuning initial noise distribution with policy optimization for diffusion models",
    arxivUrl: "https://dl.acm.org/doi/abs/10.1145/3664647.3681047",
    image: "/vpx-assets/publications/find.png",
    venue: "ACM MM 2024",
  },
  // 补满到 6 个即可
];
