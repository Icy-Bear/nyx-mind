interface Props {
  params: { project: string };
}

export default function ProjectPage({ params }: Props) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold capitalize">{params.project}</h1>
    </div>
  );
}
