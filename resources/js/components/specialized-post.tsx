import React from 'react';
import CodeSnippet from './post-types/code-snippet';
import ProjectShowcase from './post-types/project-showcase';
import TechTutorial from './post-types/tech-tutorial';
import ProblemSolution from './post-types/problem-solution';
import CodePlayground from './post-types/code-playground';

interface SpecializedPostProps {
    type: 'code_snippet' | 'project_showcase' | 'tech_tutorial' | 'problem_solution' | 'code_playground';
    data: any;
}

export default function SpecializedPost({ type, data }: SpecializedPostProps) {
    switch (type) {
        case 'code_snippet':
            return (
                <CodeSnippet
                    code={data.code}
                    language={data.language}
                    title={data.title}
                    description={data.description}
                    githubUrl={data.githubUrl}
                    isExecutable={data.isExecutable}
                />
            );

        case 'project_showcase':
            return (
                <ProjectShowcase
                    title={data.title}
                    description={data.description}
                    image={data.image}
                    technologies={data.technologies}
                    githubUrl={data.githubUrl}
                    liveUrl={data.liveUrl}
                    stats={data.stats}
                    features={data.features}
                />
            );

        case 'tech_tutorial':
            return (
                <TechTutorial
                    title={data.title}
                    content={data.content}
                    readTime={data.readTime}
                    difficulty={data.difficulty}
                    tags={data.tags}
                    sections={data.sections}
                    images={data.images}
                />
            );

        case 'problem_solution':
            return (
                <ProblemSolution
                    problem={data.problem}
                    solution={data.solution}
                    tags={data.tags}
                    difficulty={data.difficulty}
                    category={data.category}
                />
            );

        case 'code_playground':
            return (
                <CodePlayground
                    initialCode={data.initialCode}
                    language={data.language}
                    title={data.title}
                    description={data.description}
                    expectedOutput={data.expectedOutput}
                    isInteractive={data.isInteractive}
                />
            );

        default:
            return (
                <div className="apple-liquid-card border border-white/20 p-6">
                    <p className="text-white/70">Tipo de post no reconocido: {type}</p>
                </div>
            );
    }
}
