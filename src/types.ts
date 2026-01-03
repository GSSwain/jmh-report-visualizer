export interface BenchmarkData {
    benchmark: string;
    mode: string;
    threads: number;
    forks: number;
    warmupIterations: number;
    warmupTime: string;
    warmupBatchSize: number;
    measurementIterations: number;
    measurementTime: string;
    measurementBatchSize: number;
    primaryMetric: {
        score: number;
        scoreError: number;
        scoreConfidence: number[];
        scorePercentiles: { [key: string]: number };
        scoreUnit: string;
        rawData: number[][];
    };
    secondaryMetrics: { [key: string]: any };
    params?: { [key: string]: string };
}

export interface BenchmarkFile {
    fileName: string;
    data: BenchmarkData[];
}

export interface Filter {
    param: string;
    values: string[];
}
