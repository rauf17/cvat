# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import Count
from rest_framework.generics import get_object_or_404
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from cvat.apps.engine.models import LabeledShape, Task


class TaskClassCountsView(APIView):
    def get(self, request: Request, task_id: int) -> Response:
        get_object_or_404(Task, pk=task_id)

        shape_counts = (
            LabeledShape.objects.filter(
                job__segment__task_id=task_id,
                parent__isnull=True,
            )
            .values("label__name")
            .annotate(Count("id"))
            .order_by("-id__count", "label__name")
        )

        return Response(
            {
                "task_id": task_id,
                "counts": [
                    {"label": row["label__name"], "count": row["id__count"]}
                    for row in shape_counts
                ],
            }
        )

