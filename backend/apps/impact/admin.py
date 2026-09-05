from django.contrib import admin
from .models import ImpactArea, ImpactMetric, ImpactStatistic, ImpactReport


class ImpactMetricInline(admin.TabularInline):
    model = ImpactMetric
    extra = 1


@admin.register(ImpactArea)
class ImpactAreaAdmin(admin.ModelAdmin):
    inlines = [ImpactMetricInline]
    list_display = ('name', 'slug', 'order', 'color_accent', 'created_at')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ImpactStatistic)
class ImpactStatisticAdmin(admin.ModelAdmin):
    list_display = ('title', 'counter_value', 'raw_number', 'order', 'key')


@admin.register(ImpactReport)
class ImpactReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'year', 'published_date', 'download_count')
    list_filter = ('year',)
