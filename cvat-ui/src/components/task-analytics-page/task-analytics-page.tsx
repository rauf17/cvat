// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Title from 'antd/lib/typography/Title';
import Alert from 'antd/lib/alert';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import notification from 'antd/lib/notification';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import GoBackButton from 'components/common/go-back-button';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import { getCore, ServerError } from 'cvat-core-wrapper';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ChartTitle,
    Tooltip,
    Legend,
);

interface ClassCount {
    label: string;
    count: number;
}

interface ClassCountsResponse {
    task_id: number;
    counts: ClassCount[];
}

interface AxiosResponse<T> {
    data: T;
}

const core = getCore();

export default function TaskAnalyticsPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const [counts, setCounts] = useState<ClassCount[] | null>(null);
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        let isMounted = true;
        setError(null);
        setCounts(null);
        setFetching(true);

        core.server.request<AxiosResponse<ClassCountsResponse>>(
            `${core.config.backendAPI}/annotation-analytics/tasks/${id}/class-counts`,
            { method: 'GET' },
        ).then((response: AxiosResponse<ClassCountsResponse>) => {
            if (!isMounted) return;
            setCounts(response.data.counts);
        }).catch((err: unknown) => {
            if (!isMounted) return;
            let errorMessage = '';
            if (err instanceof ServerError) {
                const statusPrefix = err.code ? `HTTP ${err.code}: ` : '';
                errorMessage = `${statusPrefix}${err.message}`;
            } else if (err && typeof err === 'object') {
                const objErr = err as {
                    code?: number | string;
                    status?: number;
                    response?: { status?: number; data?: { detail?: string } };
                    message?: string;
                };
                const statusCode = objErr.response?.status ||
                    (typeof objErr.code === 'number' ? objErr.code : objErr.status);
                const detail = objErr.response?.data?.detail || objErr.message || 'Request failed';
                const statusPrefix = statusCode ? `HTTP ${statusCode}: ` : '';
                errorMessage = `${statusPrefix}${detail}`;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            } else {
                errorMessage = String(err);
            }

            setError(errorMessage);
            notification.error({
                message: 'Could not receive annotation analytics from the server',
                description: errorMessage,
            });
        }).finally(() => {
            if (isMounted) {
                setFetching(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        const cleanup = fetchData();
        return cleanup;
    }, [fetchData]);

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Class name',
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 0,
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Count',
                },
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    const data: ChartData<'bar'> = {
        labels: (counts ?? []).map((item) => item.label),
        datasets: [
            {
                label: 'Annotation Count',
                data: (counts ?? []).map((item) => item.count),
                backgroundColor: 'rgba(24, 144, 255, 0.6)',
                borderColor: 'rgba(24, 144, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className='cvat-task-analytics-page'>
            <Row className='cvat-task-analytics-header' justify='space-between' align='middle'>
                <Col>
                    <GoBackButton />
                    <Title level={3} style={{ display: 'inline', marginLeft: 16 }}>
                        {`Task #${id} Annotation Counts`}
                    </Title>
                </Col>
            </Row>
            {fetching ? (
                <CVATLoadingSpinner />
            ) : (
                <div className='cvat-task-analytics-content'>
                    {error ? (
                        <div className='cvat-task-analytics-error'>
                            <Alert
                                message='Failed to load analytics'
                                description={error}
                                type='error'
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                            <Button
                                type='primary'
                                className='cvat-task-analytics-retry-button'
                                onClick={fetchData}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : (
                        <>
                            {counts && counts.length > 0 ? (
                                <div className='cvat-task-analytics-chart-container'>
                                    <Bar data={data} options={options} />
                                </div>
                            ) : (
                                <Empty
                                    className='cvat-task-analytics-empty'
                                    description='No annotations in this task'
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
