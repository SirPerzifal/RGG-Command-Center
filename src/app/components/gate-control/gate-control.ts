import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { UrlApiService } from '../../service/url-api/url-api.service';
import { CallService } from '../../service/call.service';

@Component({
  selector: 'app-gate-control',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './gate-control.html',
  styleUrl: './gate-control.scss'
})
export class GateControl {

  constructor(private ApiUrl: UrlApiService, private cdr: ChangeDetectorRef, private callService: CallService) {

  }

  ngOnInit(): void {
    this.loadProjects();
    document.addEventListener('click', this.handleClickOutside, true);
  }
  sadf
  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  Gates: any = []
  Intercom: any = []
  ShowGates: any = []

  isGate = false
  isIntercom = false

  isLoading = false
  errMessage = ''

  getGates() {
    this.isLoading = true
    this.Gates = []
    this.ApiUrl.urlApi('/rgg/get-gates', { project_id: this.selectedProject.id }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.Gates = response.result.gates;
          this.Intercom = response.result.intercom
        } else {
          this.errMessage = response.message || 'Failed to load gates';
        }
        this.changeButton(true)
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errMessage = 'Error fetching data from server';
        console.error('Error fetching load gates:', err);
      }
    });
  }

  openGate(gate: any, is_close: boolean = false) {
    if (this.isGate) {
      this.ApiUrl.urlApi('/rgg/open-barrier', { camera_id: gate.id, is_close: is_close }).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.code === 200) {
          } else {
            this.errMessage = response.message || 'Failed to load gates';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errMessage = 'Error fetching data from server';
          console.error('Error fetching load gates:', err);
        }
      });
    } else {
      console.log('gategategate', gate)
      if (is_close) {
        this.callService.closeGate(`Intercom-${gate.id}`)
      } else {
        this.callService.openGate(`Intercom-${gate.id}`)
      }
    }
  }

  callIntercom(gate: any) {
    if (gate && gate.id) {
      this.callService.createOfferRecord(false, `Intercom-${gate.id}`, false, false, { intercom_id: gate.id, caller_name: gate.name || 'Intercom' });
    }
  }

  stopRingtone(gate: any) {
    this.callService.stopRingtone(`Intercom-${gate.id}`)
  }

  refreshChamera(gate: any) {
    this.callService.refreshChamera(`Intercom-${gate.id}`)
  }

  restartIntercom(gate: any) {
    this.callService.restartIntercom(`Intercom-${gate.id}`)
  }

  Projects: any = []
  FilteredProjects: any = []
  selectedProject: any = false
  search_project: any = ''

  loadProjects() {
    this.isLoading = true
    this.ApiUrl.urlApi('/rgg/get-project', {}).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.code === 200) {
          this.Projects = response.result;
          this.FilteredProjects = this.Projects
          this.cdr.detectChanges();
        } else {
          this.errMessage = response.message || 'Failed to load project';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errMessage = 'Error fetching data from server';
        console.error('Error fetching load project:', err);
      }
    });
  }

  searchProject(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if ((event.key === 'Backspace' && !this.search_project && this.selectedProject)) {
      this.selectProject(this.selectedProject)
    }
    this.search_project = input.value || ''
    this.is_search_focus = true
    this.FilteredProjects = this.Projects.filter((item: any) => item.name.toLowerCase().includes(this.search_project))
  }

  is_search_focus = false
  searchFocus(is_focus: boolean = true) {
    this.is_search_focus = is_focus
    this.FilteredProjects = this.Projects
  }

  selectProject(project: any) {
    if (project.id == this.selectedProject.id) {
      this.selectedProject = false
      this.Gates = []
      this.Intercom = []
    } else {
      this.selectedProject = project
      this.search_project = ''
      this.searchComponent.nativeElement.value = ''
      this.getGates()
    }
    this.cdr.detectChanges()
    this.is_search_focus = false
  }

  getCheckValue(project_id: number) {
    return this.selectedProject ? (project_id == this.selectedProject.id) : false
  }

  @ViewChild('searchInput') searchComponent!: ElementRef;
  @ViewChild('selectionInput') selectionComponent!: ElementRef;
  handleClickOutside = (event: MouseEvent) => {
    const selectionClicked = this.selectionComponent.nativeElement.contains(event.target);
    const searchClicked = this.searchComponent.nativeElement.contains(event.target);
    if (!searchClicked && !selectionClicked) {
      this.is_search_focus = false
      this.cdr.detectChanges();
    }
  };

  checkboxKeyed(event: KeyboardEvent, project: any) {
    if (event.key === 'Enter') {
      this.selectProject(project)
    }
  }

  changeButton(is_gate: boolean = true) {
    if (is_gate) {
      if (!this.isGate) {
        this.isIntercom = false
        this.isGate = true
        this.ShowGates = this.Gates
      }
    } else {
      if (!this.isIntercom) {
        this.isIntercom = true
        this.isGate = false
        this.ShowGates = this.Intercom
      }
    }
  }
}
