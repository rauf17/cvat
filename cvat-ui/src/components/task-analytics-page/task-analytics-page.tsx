// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Title from 'antd/lib/typography/Title';
import Alert from 'antd/lib/alert';
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
import { getCore } from 'cvat-core-wrapper';

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

const core = getCore();

export default function TaskAnalyticsPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const [counts, setCounts] = useState<ClassCount[] | null>(null);
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setFetching(true);
        setError(null);

        core.server.request(
            `${core.config.backendAPI}/annotation-analytics/tasks/${id}/class-counts`,
            { method: 'GET' },
        ).then((response: unknown) => {
            if (!isMounted) return;
            const res = response && typeof response === 'object' && 'data' in response ?
                (response as { data: ClassCountsResponse }).data :
                (response as ClassCountsResponse);
            setCounts(res.counts || []);
        }).catch((err: unknown) => {
            if (!isMounted) return;
            const errorMessage = err instanceof Error ? err.message : String(err);
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
                        {`Task #${id} Analytics`}
                    </Title>
                </Col>
            </Row>
            {fetching ? (
                <CVATLoadingSpinner />
            ) : (
                <div className='cvat-task-analytics-content'>
                    {error && (
                        <Alert
                            message='Error'
                            description={error}
                            type='error'
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}
                    {counts && counts.length > 0 ? (
                        <div className='cvat-task-analytics-chart-container'>
                            <Bar data={data} options={options} />
                        </div>
                    ) : (
                        <Empty
                            className='cvat-task-analytics-empty'
                            description='No annotations found for this task'
                        />
                    )}
                </div>
            )}
        </div>
    );
}

