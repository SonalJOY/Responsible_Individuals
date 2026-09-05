from rest_framework import serializers
from .models import (
    ProjectCategory,
    Project,
    ProjectObjective,
    ProjectActivity,
    ProjectKPI,
    ProjectPartner,
    ProjectMedia,
)
from apps.impact.serializers import ImpactAreaSerializer


class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = '__all__'


class ProjectObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectObjective
        fields = ('id', 'title', 'target', 'order')


class ProjectActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectActivity
        fields = ('id', 'title', 'description', 'status', 'date', 'outcome')


class ProjectKPISerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = ProjectKPI
        fields = ('id', 'metric_name', 'unit', 'baseline', 'target', 'achieved', 'percentage')

    def get_percentage(self, obj):
        if obj.target > 0:
            return min(round(float(obj.achieved / obj.target) * 100, 1), 100.0)
        return 0.0


class ProjectPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectPartner
        fields = ('id', 'partner_name', 'role', 'logo')


class ProjectMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMedia
        fields = ('id', 'caption', 'media_file', 'video_url', 'is_cover')


class ProjectListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    focus_area_name = serializers.CharField(source='focus_area.name', read_only=True)
    focus_area_color = serializers.CharField(source='focus_area.color_accent', read_only=True)
    focus_area_icon = serializers.CharField(source='focus_area.icon_name', read_only=True)
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = (
            'id', 'title', 'slug', 'category', 'category_name',
            'focus_area', 'focus_area_name', 'focus_area_color', 'focus_area_icon',
            'status', 'location', 'summary', 'start_date', 'end_date',
            'budget', 'raised_amount', 'beneficiaries_count',
            'cover_image', 'featured', 'progress_percentage', 'created_at'
        )


class ProjectDetailSerializer(ProjectListSerializer):
    focus_area_detail = ImpactAreaSerializer(source='focus_area', read_only=True)
    objectives = ProjectObjectiveSerializer(many=True, read_only=True)
    activities = ProjectActivitySerializer(many=True, read_only=True)
    kpis = ProjectKPISerializer(many=True, read_only=True)
    partners = ProjectPartnerSerializer(many=True, read_only=True)
    media = ProjectMediaSerializer(many=True, read_only=True)

    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + (
            'description', 'problem_statement', 'solution_approach', 'coordinates',
            'focus_area_detail', 'objectives', 'activities', 'kpis', 'partners', 'media'
        )
