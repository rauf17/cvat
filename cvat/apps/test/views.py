# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import Count
from rest_framework.generics import get_object_or_404
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from cvat.apps.engine.models import LabeledShape, Task
from cvat.apps.engine.permissions import TaskPermission


class TaskClassCountsView(APIView):
    iam_permission_class = TaskPermission
    detail = True
    action = "retrieve"
    basename = "tasks"

    def get(self, request: Request, task_id: int) -> Response:
        task = get_object_or_404(Task.objects.select_related("organization"), pk=task_id)
        self.check_object_permissions(request, task)

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
