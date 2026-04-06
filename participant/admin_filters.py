from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import localtime, make_aware
from datetime import timedelta, datetime, time


class CustomDateFilter(admin.SimpleListFilter):
    title = _('Created Date')
    parameter_name = 'created_at_range'

    def lookups(self, request, model_admin):
        return [
            ('today', _('Today')),
            ('yesterday', _('Yesterday')),
            ('this_week', _('This Week')),
            ('last_week', _('Last Week')),
            ('this_month', _('This Month')),
            ('last_month', _('Last Month')),
            ('this_year', _('This Year')),
            ('last_year', _('Last Year')),
        ]

    def queryset(self, request, queryset):
        today = localtime().date()  # respects TIME_ZONE

        def range_from(start_date, end_date):
            """Helper to return timezone-aware datetime range"""
            start_dt = make_aware(datetime.combine(start_date, time.min))
            end_dt = make_aware(datetime.combine(end_date, time.min))
            return queryset.filter(created_at__gte=start_dt, created_at__lt=end_dt)

        if self.value() == 'today':
            return range_from(today, today + timedelta(days=1))

        elif self.value() == 'yesterday':
            return range_from(today - timedelta(days=1), today)

        elif self.value() == 'this_week':
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=7)
            return range_from(start, end)

        elif self.value() == 'last_week':
            end = today - timedelta(days=today.weekday())
            start = end - timedelta(days=7)
            return range_from(start, end)

        elif self.value() == 'this_month':
            start = today.replace(day=1)
            next_month = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
            return range_from(start, next_month)

        elif self.value() == 'last_month':
            this_month_start = today.replace(day=1)
            last_month_end = this_month_start - timedelta(days=1)
            last_month_start = last_month_end.replace(day=1)
            return range_from(last_month_start, this_month_start)

        elif self.value() == 'this_year':
            start = today.replace(month=1, day=1)
            end = start.replace(year=start.year + 1)
            return range_from(start, end)

        elif self.value() == 'last_year':
            this_year_start = today.replace(month=1, day=1)
            last_year_end = this_year_start
            last_year_start = last_year_end.replace(year=last_year_end.year - 1)
            return range_from(last_year_start, last_year_end)

        return queryset
