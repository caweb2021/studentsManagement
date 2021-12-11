jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IStudents, Students } from '../students.model';
import { StudentsService } from '../service/students.service';

import { StudentsRoutingResolveService } from './students-routing-resolve.service';

describe('Service Tests', () => {
  describe('Students routing resolve service', () => {
    let mockRouter: Router;
    let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
    let routingResolveService: StudentsRoutingResolveService;
    let service: StudentsService;
    let resultStudents: IStudents | undefined;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Router, ActivatedRouteSnapshot],
      });
      mockRouter = TestBed.inject(Router);
      mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
      routingResolveService = TestBed.inject(StudentsRoutingResolveService);
      service = TestBed.inject(StudentsService);
      resultStudents = undefined;
    });

    describe('resolve', () => {
      it('should return IStudents returned by find', () => {
        // GIVEN
        service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
        mockActivatedRouteSnapshot.params = { id: 'ABC' };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultStudents = result;
        });

        // THEN
        expect(service.find).toBeCalledWith('ABC');
        expect(resultStudents).toEqual({ id: 'ABC' });
      });

      it('should return new IStudents if id is not provided', () => {
        // GIVEN
        service.find = jest.fn();
        mockActivatedRouteSnapshot.params = {};

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultStudents = result;
        });

        // THEN
        expect(service.find).not.toBeCalled();
        expect(resultStudents).toEqual(new Students());
      });

      it('should route to 404 page if data not found in server', () => {
        // GIVEN
        spyOn(service, 'find').and.returnValue(of(new HttpResponse({ body: null })));
        mockActivatedRouteSnapshot.params = { id: 'ABC' };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultStudents = result;
        });

        // THEN
        expect(service.find).toBeCalledWith('ABC');
        expect(resultStudents).toEqual(undefined);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
      });
    });
  });
});
