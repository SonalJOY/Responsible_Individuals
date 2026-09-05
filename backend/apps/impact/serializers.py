from rest_framework import serializers
from .models import ImpactArea, ImpactMetric, ImpactStatistic, ImpactReport


class ImpactMetricSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = ImpactMetric
        fields = ('id', 'metric_type', 'name', 'unit', 'baseline_value', 'target_value', 'achieved_value', 'percentage')

    def get_percentage(self, obj):
        if obj.target_value > 0:
            return min(round(float(obj.achieved_value / obj.target_value) * 100, 1), 100.0)
        return 0.0


class ImpactAreaSerializer(serializers.ModelSerializer):
    metrics = ImpactMetricSerializer(many=True, read_only=True)

    class Meta:
        model = ImpactArea
        fields = ('id', 'slug', 'name', 'tagline', 'description', 'icon_name', 'color_accent', 'sdg_alignment', 'cover_image', 'order', 'metrics')


class ImpactStatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactStatistic
        fields = ('id', 'key', 'title', 'counter_value', 'raw_number', 'suffix', 'icon_name', 'order')


class ImpactReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactReport
        fields = ('id', 'title', 'year', 'summary', 'cover_image', 'pdf_file', 'published_date', 'download_count')
